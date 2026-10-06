import * as Blockly from 'blockly';
import { javascriptGenerator, Order } from 'blockly/javascript';
import { LevelSection } from '@/components/BlocklyMaze';

// =============================================================================
// TYPES & INTERFACES (Jupiter Level 3: 4-Slot Party Authentication)
// =============================================================================

export interface SingleProfileData {
  className: 'AdminProfile' | 'TechProfile' | 'SecurityProfile' | 'VisitorProfile' | string;
  isPrivate: boolean;
  hasPublicLeak: boolean;
  hasPrivateClearance?: boolean;
  hasPublicRole?: boolean;
  role?: string;
  clearanceLevel?: number;
  methods: string[];
}

export interface PlayerBlueprint {
  classes: Record<string, SingleProfileData>;
  instantiations: string[];
  rawJavaCode: string;
}

export const INITIAL_PLAYER_BLUEPRINT: PlayerBlueprint = {
  classes: {},
  instantiations: [],
  rawJavaCode: '',
};

export type AuditScenario = 'MISSING_BADGES' | 'ADMIN_FAIL' | 'TECH_FAIL' | 'SECURITY_FAIL' | 'VISITOR_FAIL' | 'SUCCESS';

export interface AuditResult {
  success: boolean;
  scenario: AuditScenario;
  failedSlot?: 1 | 2 | 3 | 4;
  message: string;
}

// =============================================================================
// SCENARIO AUDITING (The 4-Slot Validation Sequence)
// =============================================================================

export function auditBlueprint(payload: PlayerBlueprint): AuditResult {
  const instantiations = payload?.instantiations || [];
  const classes = payload?.classes || {};

  const hasAdminBadge = instantiations.includes('AdminProfile');
  const hasTechBadge = instantiations.includes('TechProfile');
  const hasSecurityBadge = instantiations.includes('SecurityProfile');
  const hasVisitorBadge = instantiations.includes('VisitorProfile');

  const cleanRole = (r?: string) => (r || '').replace(/['"]/g, '').trim().toLowerCase();

  // Step 1: Check Instantiation (Exactly 4 physical badges printed)
  if (instantiations.length !== 4 || !hasAdminBadge || !hasTechBadge || !hasSecurityBadge || !hasVisitorBadge) {
    const missingSlot = !hasAdminBadge ? 1 : !hasTechBadge ? 2 : !hasSecurityBadge ? 3 : 4;
    return {
      success: false,
      scenario: 'MISSING_BADGES',
      failedSlot: missingSlot,
      message: instantiations.length > 4
        ? 'Print only 4 badges, one for each profile.'
        : 'Print all 4 badges: Admin, Tech, Security, and Visitor.',
    };
  }

  // Step 2: Check The Admin (AdminProfile: private clearanceLevel = 4, public role = "Admin", unlockDoors & soundAlarm)
  const admin = classes['AdminProfile'];
  const adminMethods = admin?.methods || [];
  const adminHasUnlock = adminMethods.includes('UNLOCK_DOORS') || adminMethods.includes('OVERRIDE');
  const adminHasAlarm = adminMethods.includes('SOUND_ALARM') || adminMethods.includes('REBOOT');
  const adminValid =
    admin &&
    Boolean(admin.hasPrivateClearance || (admin.isPrivate && !admin.hasPublicLeak)) &&
    ((admin.clearanceLevel || 0) === 4 || (admin.clearanceLevel || 0) === 5) &&
    cleanRole(admin.role) === 'admin' &&
    Boolean(admin.hasPublicRole || admin.role) &&
    adminHasUnlock &&
    adminHasAlarm;

  if (!adminValid) {
    return {
      success: false,
      scenario: 'ADMIN_FAIL',
      failedSlot: 1,
      message: 'AdminProfile needs: Clearance 4, Role "Admin", unlockDoors(), and soundAlarm().',
    };
  }

  // Step 3: Check The Technician (TechProfile: private clearanceLevel = 3, public role = "Maintenance", fixErrors & checkHealth)
  const tech = classes['TechProfile'];
  const techMethods = tech?.methods || [];
  const techHasFix = techMethods.includes('FIX_ERRORS') || techMethods.includes('DIAGNOSTICS');
  const techHasHealth = techMethods.includes('CHECK_HEALTH') || techMethods.includes('CALIBRATE');
  const techValid =
    tech &&
    Boolean(tech.hasPrivateClearance || (tech.isPrivate && !tech.hasPublicLeak)) &&
    (tech.clearanceLevel || 0) === 3 &&
    cleanRole(tech.role) === 'maintenance' &&
    Boolean(tech.hasPublicRole || tech.role) &&
    techHasFix &&
    techHasHealth;

  if (!techValid) {
    return {
      success: false,
      scenario: 'TECH_FAIL',
      failedSlot: 2,
      message: 'TechProfile needs: Clearance 3, Role "Maintenance", fixErrors(), and checkHealth().',
    };
  }

  // Step 4: Check The Security Officer (SecurityProfile: private clearanceLevel = 2, public role = "Security", soundAlarm [shared] & scanRoom)
  const sec = classes['SecurityProfile'];
  const secMethods = sec?.methods || [];
  const secHasAlarm = secMethods.includes('SOUND_ALARM') || secMethods.includes('OVERRIDE');
  const secHasScan = secMethods.includes('SCAN_ROOM') || secMethods.includes('SCAN_INTRUDERS');
  const secValid =
    sec &&
    Boolean(sec.hasPrivateClearance || (sec.isPrivate && !sec.hasPublicLeak)) &&
    (sec.clearanceLevel || 0) === 2 &&
    cleanRole(sec.role) === 'security' &&
    Boolean(sec.hasPublicRole || sec.role) &&
    ((secHasAlarm && secHasScan) || secMethods.includes('SCAN_INTRUDERS'));

  if (!secValid) {
    return {
      success: false,
      scenario: 'SECURITY_FAIL',
      failedSlot: 3,
      message: 'SecurityProfile needs: Clearance 2, Role "Security", soundAlarm(), and scanRoom().',
    };
  }

  // Step 5: Check The Visitor (VisitorProfile: private clearanceLevel = 1, public role = "Visitor", takeTour)
  const visitor = classes['VisitorProfile'];
  const visitorMethods = visitor?.methods || [];
  const visitorHasTour = visitorMethods.includes('TAKE_TOUR') || visitorMethods.includes('TOUR');
  const visitorValid =
    visitor &&
    Boolean(visitor.hasPrivateClearance || (visitor.isPrivate && !visitor.hasPublicLeak)) &&
    (visitor.clearanceLevel || 0) === 1 &&
    cleanRole(visitor.role) === 'visitor' &&
    Boolean(visitor.hasPublicRole || visitor.role) &&
    visitorHasTour;

  if (!visitorValid) {
    return {
      success: false,
      scenario: 'VISITOR_FAIL',
      failedSlot: 4,
      message: 'VisitorProfile needs: Clearance 1, Role "Visitor", and takeTour().',
    };
  }

  // Step 6: Success
  return {
    success: true,
    scenario: 'SUCCESS',
    message: "AUTHORIZED ROLE RECOGNIZED. THREAT PROTOCOLS STANDING DOWN.",
  };
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

let isJupiter3BlocksRegistered = false;

export function registerJupiterLevel3Blocks() {
  if (isJupiter3BlocksRegistered) return;
  isJupiter3BlocksRegistered = true;

  // 1. Class Wrapper (The Blueprint with Class Dropdown)
  Blockly.Blocks['java_class_wrapper'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Blueprint: class')
        .appendField(
          new Blockly.FieldDropdown([
            ['AdminProfile', 'AdminProfile'],
            ['TechProfile', 'TechProfile'],
            ['SecurityProfile', 'SecurityProfile'],
            ['VisitorProfile', 'VisitorProfile'],
          ]),
          'CLASS_NAME'
        );
      this.appendStatementInput('CLASS_BODY')
        .setCheck(null);
      this.setColour(230);
      this.setDeletable(true);
      this.setTooltip('Construct a class blueprint for one of the four required profiles.');
    },
  };

  javascriptGenerator.forBlock['java_class_wrapper'] = function (block: any) {
    const className = block.getFieldValue('CLASS_NAME') || 'AdminProfile';
    const body = javascriptGenerator.statementToCode(block, 'CLASS_BODY');
    return `public class ${className} {\n${body}}\n\n`;
  };

  // 2A. Encapsulated Clearance Level (Hidden Data - Number Only)
  Blockly.Blocks['java_private_clearance'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Private Data: clearanceLevel =')
        .appendField(
          new Blockly.FieldDropdown([
            ['4', '4'],
            ['3', '3'],
            ['2', '2'],
            ['1', '1'],
          ]),
          'CLEARANCE_NUM'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Sets private clearance level number.');
    },
  };

  javascriptGenerator.forBlock['java_private_clearance'] = function (block: any) {
    const num = block.getFieldValue('CLEARANCE_NUM') || '4';
    return `    private int clearanceLevel = ${num};\n`;
  };

  // 2B. Encapsulated Role (Hidden Data - Roles Only)
  Blockly.Blocks['java_private_role'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Private Data: role =')
        .appendField(
          new Blockly.FieldDropdown([
            ['"Admin"', 'Admin'],
            ['"Maintenance"', 'Maintenance'],
            ['"Security"', 'Security'],
          ]),
          'ROLE_STR'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Sets private role identifier.');
    },
  };

  javascriptGenerator.forBlock['java_private_role'] = function (block: any) {
    const role = block.getFieldValue('ROLE_STR') || 'Maintenance';
    return `    private String role = "${role}";\n`;
  };

  // Legacy fallback for java_private_property
  Blockly.Blocks['java_private_property'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Private Data:')
        .appendField(
          new Blockly.FieldDropdown([
            ['clearanceLevel = 4', 'CLEARANCE_4'],
            ['clearanceLevel = 3', 'CLEARANCE_3'],
            ['clearanceLevel = 2', 'CLEARANCE_2'],
            ['clearanceLevel = 1', 'CLEARANCE_1'],
            ['clearanceLevel = 5', 'CLEARANCE_5'],
            ['role = "Maintenance"', 'ROLE_MAINTENANCE'],
            ['role = "Security"', 'ROLE_SECURITY'],
          ]),
          'PROPERTY_PRESET'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Private data accessible only within this class.');
    },
  };

  javascriptGenerator.forBlock['java_private_property'] = function (block: any) {
    const preset = block.getFieldValue('PROPERTY_PRESET');
    if (preset === 'CLEARANCE_4' || preset === 'CLEARANCE_5') return `    private int clearanceLevel = 4;\n`;
    if (preset === 'CLEARANCE_3') return `    private int clearanceLevel = 3;\n`;
    if (preset === 'CLEARANCE_2') return `    private int clearanceLevel = 2;\n`;
    if (preset === 'CLEARANCE_1') return `    private int clearanceLevel = 1;\n`;
    if (preset === 'ROLE_SECURITY') return `    private String role = "Security";\n`;
    return `    private String role = "Maintenance";\n`;
  };

  // 3A. Exposed Clearance Level (Public Data - Number Only)
  Blockly.Blocks['java_public_clearance'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Public Data: clearanceLevel =')
        .appendField(
          new Blockly.FieldDropdown([
            ['1', '1'],
            ['2', '2'],
            ['3', '3'],
            ['4', '4'],
          ]),
          'CLEARANCE_NUM'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#e11d48');
      this.setTooltip('Public clearance level visible directly to external scanners.');
    },
  };

  javascriptGenerator.forBlock['java_public_clearance'] = function (block: any) {
    const num = block.getFieldValue('CLEARANCE_NUM') || '1';
    return `    public int clearanceLevel = ${num};\n`;
  };

  // 3B. Exposed Role (Public Data - Role Only)
  Blockly.Blocks['java_public_role'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Public Data: role =')
        .appendField(
          new Blockly.FieldDropdown([
            ['"Admin"', 'Admin'],
            ['"Maintenance"', 'Maintenance'],
            ['"Security"', 'Security'],
            ['"Visitor"', 'Visitor'],
          ]),
          'ROLE_STR'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#e11d48');
      this.setTooltip('Public role visible directly to external scanners.');
    },
  };

  javascriptGenerator.forBlock['java_public_role'] = function (block: any) {
    const role = block.getFieldValue('ROLE_STR') || 'Admin';
    return `    public String role = "${role}";\n`;
  };

  // Legacy fallback for java_public_property
  Blockly.Blocks['java_public_property'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Public Data:')
        .appendField(
          new Blockly.FieldDropdown([
            ['clearanceLevel = 1', 'CLEARANCE_1'],
            ['role = "Visitor"', 'ROLE_VISITOR'],
          ]),
          'PROPERTY_PRESET'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#e11d48');
    },
  };

  javascriptGenerator.forBlock['java_public_property'] = function (block: any) {
    const preset = block.getFieldValue('PROPERTY_PRESET');
    if (preset === 'CLEARANCE_1') return `    public int clearanceLevel = 1;\n`;
    return `    public String role = "Visitor";\n`;
  };

  // 4. Method Block (The Actions)
  Blockly.Blocks['java_method_block'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Action:')
        .appendField(
          new Blockly.FieldDropdown([
            ['unlockDoors()', 'UNLOCK_DOORS'],
            ['soundAlarm()', 'SOUND_ALARM'],
            ['restartSystem()', 'RESTART_SYSTEM'],
            ['fixErrors()', 'FIX_ERRORS'],
            ['checkHealth()', 'CHECK_HEALTH'],
            ['scanRoom()', 'SCAN_ROOM'],
            ['takeTour()', 'TAKE_TOUR'],
            ['callHelp()', 'CALL_HELP'],
          ]),
          'METHOD_NAME'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip('Teaches your badge how to execute this action when called.');
    },
  };

  javascriptGenerator.forBlock['java_method_block'] = function (block: any) {
    const methodName = block.getFieldValue('METHOD_NAME');
    let mName = 'unlockDoors';
    if (methodName === 'SOUND_ALARM' || methodName === 'REBOOT') mName = 'soundAlarm';
    else if (methodName === 'RESTART_SYSTEM') mName = 'restartSystem';
    else if (methodName === 'FIX_ERRORS' || methodName === 'DIAGNOSTICS') mName = 'fixErrors';
    else if (methodName === 'CHECK_HEALTH' || methodName === 'CALIBRATE') mName = 'checkHealth';
    else if (methodName === 'SCAN_ROOM' || methodName === 'SCAN_INTRUDERS') mName = 'scanRoom';
    else if (methodName === 'TAKE_TOUR' || methodName === 'TOUR') mName = 'takeTour';
    else if (methodName === 'CALL_HELP') mName = 'callHelp';
    else if (methodName === 'OVERRIDE' || methodName === 'UNLOCK_DOORS') mName = 'unlockDoors';
    return `    public void ${mName}() {\n    }\n`;
  };

  // 5. Instantiation Block (Printing the Badges)
  Blockly.Blocks['java_instantiate_object'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Print Physical Badge: new')
        .appendField(
          new Blockly.FieldDropdown([
            ['AdminProfile', 'AdminProfile'],
            ['TechProfile', 'TechProfile'],
            ['SecurityProfile', 'SecurityProfile'],
            ['VisitorProfile', 'VisitorProfile'],
          ]),
          'CLASS_NAME'
        )
        .appendField('()');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(45);
      this.setTooltip('Instantiates a physical badge object in memory for the scanner.');
    },
  };

  javascriptGenerator.forBlock['java_instantiate_object'] = function (block: any) {
    const cName = block.getFieldValue('CLASS_NAME') || 'AdminProfile';
    const varName = cName.charAt(0).toLowerCase() + cName.slice(1);
    return `${cName} ${varName} = new ${cName}();\n`;
  };
}

// =============================================================================
// WORKSPACE PARSER (Execution-Only / Live Syntax Sync)
// =============================================================================

export function parseJupiterLevel3Workspace(ws: Blockly.Workspace): PlayerBlueprint {
  if (!ws) return INITIAL_PLAYER_BLUEPRINT;

  const allBlocks = ws.getAllBlocks(false);
  const classBlocks = allBlocks.filter(b => b.type === 'java_class_wrapper');
  const instantiateBlocks = allBlocks.filter(b => b.type === 'java_instantiate_object');

  const classes: Record<string, SingleProfileData> = {};

  classBlocks.forEach(cBlock => {
    const cName = cBlock.getFieldValue('CLASS_NAME') || 'AdminProfile';
    let isPrivate = true;
    let hasPublicLeak = false;
    let hasPrivateClearance = false;
    let hasPublicClearance = false;
    let hasPublicRole = false;
    let hasPrivateRole = false;
    let role: string | undefined = undefined;
    let clearanceLevel: number | undefined = undefined;
    const methods: string[] = [];

    let curBlock: Blockly.Block | null = cBlock.getInputTargetBlock('CLASS_BODY');
    while (curBlock) {
      if (curBlock.type === 'java_private_clearance') {
        hasPrivateClearance = true;
        clearanceLevel = parseInt(curBlock.getFieldValue('CLEARANCE_NUM') || '4', 10);
      } else if (curBlock.type === 'java_private_role') {
        hasPrivateRole = true;
        role = curBlock.getFieldValue('ROLE_STR') || 'Maintenance';
      } else if (curBlock.type === 'java_private_property') {
        const preset = curBlock.getFieldValue('PROPERTY_PRESET');
        if (preset === 'CLEARANCE_4' || preset === 'CLEARANCE_5') {
          hasPrivateClearance = true;
          clearanceLevel = 4;
        } else if (preset === 'CLEARANCE_3') {
          hasPrivateClearance = true;
          clearanceLevel = 3;
        } else if (preset === 'CLEARANCE_2') {
          hasPrivateClearance = true;
          clearanceLevel = 2;
        } else if (preset === 'CLEARANCE_1') {
          hasPrivateClearance = true;
          clearanceLevel = 1;
        } else if (preset === 'ROLE_MAINTENANCE') {
          hasPrivateRole = true;
          role = 'Maintenance';
        } else if (preset === 'ROLE_SECURITY') {
          hasPrivateRole = true;
          role = 'Security';
        }
      } else if (curBlock.type === 'java_public_clearance') {
        hasPublicClearance = true;
        hasPublicLeak = true;
        isPrivate = false;
        clearanceLevel = parseInt(curBlock.getFieldValue('CLEARANCE_NUM') || '1', 10);
      } else if (curBlock.type === 'java_public_role') {
        hasPublicRole = true;
        role = curBlock.getFieldValue('ROLE_STR') || 'Admin';
      } else if (curBlock.type === 'java_public_property') {
        const preset = curBlock.getFieldValue('PROPERTY_PRESET');
        if (preset === 'CLEARANCE_1') {
          hasPublicClearance = true;
          hasPublicLeak = true;
          isPrivate = false;
          clearanceLevel = 1;
        } else if (preset === 'ROLE_VISITOR') {
          hasPublicRole = true;
          role = 'Visitor';
        }
      } else if (curBlock.type === 'java_method_block') {
        const mKey = curBlock.getFieldValue('METHOD_NAME') || 'OVERRIDE';
        methods.push(mKey);
      }
      curBlock = curBlock.getNextBlock();
    }

    const existing = classes[cName];
    const resolvedClearance = clearanceLevel !== undefined ? clearanceLevel : existing?.clearanceLevel;
    const resolvedRole = role || existing?.role;
    const mergedMethods = Array.from(new Set([...(existing?.methods || []), ...methods]));
    const combinedPrivateClearance = (existing?.hasPrivateClearance || false) || hasPrivateClearance;
    const combinedPublicClearance = (existing?.hasPublicLeak || false) || hasPublicClearance;
    const combinedPublicRole = (existing?.hasPublicRole || false) || hasPublicRole;

    classes[cName] = {
      className: cName,
      isPrivate: combinedPrivateClearance && !combinedPublicClearance,
      hasPublicLeak: combinedPublicClearance,
      hasPrivateClearance: combinedPrivateClearance,
      hasPublicRole: combinedPublicRole,
      role: resolvedRole,
      clearanceLevel: resolvedClearance,
      methods: mergedMethods,
    };
  });

  const instantiations = instantiateBlocks.map(b => b.getFieldValue('CLASS_NAME') || 'AdminProfile');

  let rawJavaCode = '';
  try {
    rawJavaCode = javascriptGenerator.workspaceToCode(ws);
  } catch (e) {
    console.warn('Java generation error:', e);
  }

  return {
    classes,
    instantiations,
    rawJavaCode,
  };
}

// =============================================================================
// STARTER XML & TOOLBOX
// =============================================================================

export const JUPITER_LEVEL_3_STARTER_XML = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="java_class_wrapper" id="jupiter3_starter_admin" x="40" y="25" deletable="true" movable="true">
    <field name="CLASS_NAME">AdminProfile</field>
  </block>
  <block type="java_class_wrapper" id="jupiter3_starter_tech" x="40" y="95" deletable="true" movable="true">
    <field name="CLASS_NAME">TechProfile</field>
  </block>
  <block type="java_class_wrapper" id="jupiter3_starter_sec" x="40" y="165" deletable="true" movable="true">
    <field name="CLASS_NAME">SecurityProfile</field>
  </block>
  <block type="java_class_wrapper" id="jupiter3_starter_visitor" x="40" y="235" deletable="true" movable="true">
    <field name="CLASS_NAME">VisitorProfile</field>
  </block>
</xml>
`.trim();

export function getJupiterLevel3Toolbox(): string {
  return `
<xml xmlns="https://developers.google.com/blockly/xml" id="toolbox" style="display: none">
  <category name="Blueprints" colour="#6366F1">
    <block type="java_class_wrapper">
      <field name="CLASS_NAME">AdminProfile</field>
    </block>
  </category>
  <category name="Profile Data" colour="#10B981">
    <block type="java_private_clearance">
      <field name="CLEARANCE_NUM">4</field>
    </block>
    <block type="java_public_role">
      <field name="ROLE_STR">Admin</field>
    </block>
  </category>
  <category name="Actions" colour="#8B5CF6">
    <block type="java_method_block">
      <field name="METHOD_NAME">UNLOCK_DOORS</field>
    </block>
  </category>
  <category name="Print Badges" colour="#FF912D">
    <block type="java_instantiate_object">
      <field name="CLASS_NAME">AdminProfile</field>
    </block>
  </category>
</xml>
  `.trim();
}

// =============================================================================
// MISSION SECTIONS CONFIG
// =============================================================================

export const JUPITER_3_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: 'The AI Core Lockdown',
    subtag: 'OOP PARTY AUTHENTICATION',
    desc:
      'The Main Vault is on strict lockdown! The AI Core requires 4 distinct authentication badges (Admin, Technician, Security, and Visitor) to open the chamber.',
    tip: 'Build four class blueprints and instantiate all four as physical badges before scanning.',
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: 'Read all 4 Datapad clues', completed: false },
      { id: 2, text: 'Configure data and actions for all 4 profiles', completed: false },
      { id: 3, text: 'Successfully scan all 4 badges to unlock the vault', completed: false },
    ],
  },
];

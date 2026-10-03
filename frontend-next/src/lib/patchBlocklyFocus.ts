import * as Blockly from 'blockly';

/**
 * Monkey-patches Blockly's FocusManager (Blockly 13.x) to prevent fatal crashes
 * like "Attempted to focus unregistered node: [object Object]" or
 * "Attempted to focus unregistered tree: ..." when components unmount,
 * workspaces are disposed, or during React 19 fast refresh / double-mounts.
 */
export function patchBlocklyFocus() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    const fm = (Blockly as any).getFocusManager?.();
    if (!fm) return;

    const proto = Object.getPrototypeOf(fm);
    if (!proto || (proto as any).__netstart_patched__) return;
    (proto as any).__netstart_patched__ = true;

    // 1. Guard focusNode
    const origFocusNode = proto.focusNode;
    proto.focusNode = function (node: any) {
      if (!node) return;
      try {
        if (typeof node.getFocusableTree === 'function') {
          const tree = node.getFocusableTree();
          if (tree && !this.isRegistered(tree)) {
            if (typeof tree.getRootFocusableNode === 'function' && !tree.disposed) {
              try {
                this.registerTree(tree, !!tree.injectionDiv || !!tree.isFlyout);
              } catch {
                return;
              }
            } else {
              return;
            }
          }
        }
        return origFocusNode.apply(this, arguments as any);
      } catch (err: any) {
        if (err && String(err.message || '').toLowerCase().includes('unregistered')) {
          return;
        }
        throw err;
      }
    };

    // 2. Guard focusTree
    const origFocusTree = proto.focusTree;
    proto.focusTree = function (tree: any) {
      if (!tree) return;
      try {
        if (!this.isRegistered(tree)) {
          if (typeof tree.getRootFocusableNode === 'function' && !tree.disposed) {
            try {
              this.registerTree(tree, !!tree.injectionDiv || !!tree.isFlyout);
            } catch {
              return;
            }
          } else {
            return;
          }
        }
        return origFocusTree.apply(this, arguments as any);
      } catch (err: any) {
        if (err && String(err.message || '').toLowerCase().includes('unregistered')) {
          return;
        }
        throw err;
      }
    };

    // 3. Guard unregisterTree
    const origUnregisterTree = proto.unregisterTree;
    proto.unregisterTree = function (tree: any) {
      if (!tree) return;
      try {
        if (!this.isRegistered(tree)) return;
        return origUnregisterTree.apply(this, arguments as any);
      } catch (err: any) {
        if (err && String(err.message || '').toLowerCase().includes('not registered')) {
          return;
        }
        throw err;
      }
    };

    // 4. Guard registerTree
    const origRegisterTree = proto.registerTree;
    proto.registerTree = function (tree: any, autoTabbable: boolean) {
      if (!tree) return;
      try {
        if (this.isRegistered(tree)) return;
        return origRegisterTree.apply(this, arguments as any);
      } catch (err: any) {
        if (err && String(err.message || '').toLowerCase().includes('already registered')) {
          return;
        }
        throw err;
      }
    };

    // 5. Guard defocusCurrentFocusedNode
    const origDefocus = proto.defocusCurrentFocusedNode;
    if (typeof origDefocus === 'function') {
      proto.defocusCurrentFocusedNode = function () {
        try {
          return origDefocus.apply(this, arguments as any);
        } catch (err: any) {
          if (err && String(err.message || '').toLowerCase().includes('unregistered')) {
            return;
          }
          throw err;
        }
      };
    }
  } catch (e) {
    console.warn('Blockly focus patch initialization warning:', e);
  }
}

// Auto-run if running in browser
if (typeof window !== 'undefined') {
  patchBlocklyFocus();
}

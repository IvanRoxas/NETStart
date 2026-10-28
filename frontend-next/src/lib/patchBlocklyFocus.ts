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
    const patchTarget = (target: any) => {
      if (!target || target.__netstart_patched__) return;
      target.__netstart_patched__ = true;

      // 1. Guard focusNode
      const origFocusNode = target.focusNode;
      if (typeof origFocusNode === 'function') {
        target.focusNode = function (node: any) {
          if (!node) return;
          try {
            if (node.disposed || (typeof node.isDisposed === 'function' && node.isDisposed())) {
              return;
            }
            if (typeof node.getFocusableTree === 'function') {
              const tree = node.getFocusableTree();
              if (!tree || tree.disposed || (typeof tree.isDisposed === 'function' && tree.isDisposed())) {
                return;
              }
              if (!this.isRegistered(tree)) {
                if (typeof tree.getRootFocusableNode === 'function') {
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
            const msg = String(err?.message || '').toLowerCase();
            if (
              msg.includes('unregistered') ||
              msg.includes('not registered') ||
              msg.includes('null') ||
              msg.includes('disposed')
            ) {
              return;
            }
            throw err;
          }
        };
      }

      // 2. Guard focusTree
      const origFocusTree = target.focusTree;
      if (typeof origFocusTree === 'function') {
        target.focusTree = function (tree: any) {
          if (!tree) return;
          try {
            if (tree.disposed || (typeof tree.isDisposed === 'function' && tree.isDisposed())) {
              return;
            }
            if (!this.isRegistered(tree)) {
              if (typeof tree.getRootFocusableNode === 'function') {
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
            const msg = String(err?.message || '').toLowerCase();
            if (
              msg.includes('unregistered') ||
              msg.includes('not registered') ||
              msg.includes('null') ||
              msg.includes('disposed')
            ) {
              return;
            }
            throw err;
          }
        };
      }

      // 3. Guard unregisterTree
      const origUnregisterTree = target.unregisterTree;
      if (typeof origUnregisterTree === 'function') {
        target.unregisterTree = function (tree: any) {
          if (!tree) return;
          try {
            if (!this.isRegistered(tree)) return;
            return origUnregisterTree.apply(this, arguments as any);
          } catch (err: any) {
            const msg = String(err?.message || '').toLowerCase();
            if (msg.includes('not registered') || msg.includes('unregistered')) {
              return;
            }
            throw err;
          }
        };
      }

      // 4. Guard registerTree
      const origRegisterTree = target.registerTree;
      if (typeof origRegisterTree === 'function') {
        target.registerTree = function (tree: any, autoTabbable: boolean) {
          if (!tree) return;
          try {
            if (this.isRegistered(tree)) return;
            return origRegisterTree.apply(this, arguments as any);
          } catch (err: any) {
            const msg = String(err?.message || '').toLowerCase();
            if (msg.includes('already registered')) {
              return;
            }
            throw err;
          }
        };
      }

      // 5. Guard defocusCurrentFocusedNode
      const origDefocus = target.defocusCurrentFocusedNode;
      if (typeof origDefocus === 'function') {
        target.defocusCurrentFocusedNode = function () {
          try {
            return origDefocus.apply(this, arguments as any);
          } catch (err: any) {
            const msg = String(err?.message || '').toLowerCase();
            if (msg.includes('unregistered') || msg.includes('not registered') || msg.includes('null')) {
              return;
            }
            throw err;
          }
        };
      }
    };

    const FocusManagerClass = (Blockly as any).FocusManager;
    if (FocusManagerClass?.prototype) {
      patchTarget(FocusManagerClass.prototype);
    }

    try {
      const fm = (Blockly as any).getFocusManager?.();
      if (fm) {
        const proto = Object.getPrototypeOf(fm);
        if (proto) patchTarget(proto);
        patchTarget(fm);
      }
    } catch {}
  } catch (e) {
    console.warn('Blockly focus patch initialization warning:', e);
  }
}

// Auto-run if running in browser
if (typeof window !== 'undefined') {
  patchBlocklyFocus();
}

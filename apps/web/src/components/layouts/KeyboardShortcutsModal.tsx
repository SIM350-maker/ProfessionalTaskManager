'use client';

import { Modal } from '@/components/ui/modal';

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open search / command palette' },
      { keys: ['G', 'D'], description: 'Go to Dashboard' },
      { keys: ['G', 'T'], description: 'Go to Tasks' },
      { keys: ['G', 'P'], description: 'Go to Projects' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { keys: ['?'], description: 'Show this shortcuts panel' },
      { keys: ['Esc'], description: 'Close a dialog or modal' },
    ],
  },
];

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-5">
        {SHORTCUT_GROUPS.map((group) => (
          <div key={group.title}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">{group.title}</h3>
            <div className="space-y-2">
              {group.shortcuts.map((shortcut) => (
                <div key={shortcut.description} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <kbd
                        key={i}
                        className="rounded-md border border-border-default bg-bg-subtle px-1.5 py-0.5 text-xs font-medium text-text-primary"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

---
epic: delete-tasks-and-groups
created: 2026-03-19T00:00:00Z
status: initializing
---

# Delete Tasks and Groups

## Overview

Add the ability to delete individual tasks from the board and leave (delete) groups from the sidebar.

## Background

- Task deletion is already supported at the protocol level (`task.deleted` event in `src/store/task-events.ts` and `src/store/task-reducer.ts`), but no UI exposes it.
- Groups use MLS via marmot-ts. The library provides `client.leaveGroup(groupId)` / `group.leave()` which sends a Leave Proposal to the relay, removing the user from the group. This is the correct "delete group" semantic for MLS (groups cannot be truly deleted, only left).

## Functional Requirements

### Task Deletion

- Each task card on the board must have a **Delete** button.
- Clicking Delete shows a confirmation dialog ("Delete this task? This cannot be undone.") to prevent accidental deletion.
- On confirmation, a `task.deleted` event is dispatched through the existing `dispatch()` mechanism in `task-store.tsx`.
- The task is removed from the board immediately (optimistic update via existing reducer).
- The delete event is broadcast to all group members via MLS (same as other task events).
- Any group member can delete any task (no ownership restriction).
- The `task.deleted` event already includes `taskId`, `updatedAt`, and `updatedBy` fields — these must be populated correctly.

### Group Leaving ("Delete Group")

- Each group entry in the sidebar (GroupManager) must have a **Leave** button/option.
- Clicking Leave shows a confirmation dialog ("Leave this group? You will lose access to all its tasks.").
- On confirmation:
  1. Call `client.leaveGroup(groupId)` (marmot-ts) to send the MLS Leave Proposal to the relay.
  2. Clear local task event storage for the group: `clearEvents(groupId)` from `src/store/persistence.ts`.
  3. If the left group was the currently selected group, deselect it (set selected group to null).
  4. The group disappears from the sidebar (marmot-ts `groupsUpdated` event handles this after leave proposal is processed).
- Error handling: if `leaveGroup()` throws, show an error toast and do not remove the group from local state.

## Non-Requirements

- No ability to remove other members from a group (not supported by this feature).
- No ability to restore deleted tasks (hard delete, as per existing protocol).
- No bulk delete.

## UI/UX

- **Task delete button**: Small destructive/ghost button with a trash icon, placed in the task card action row alongside existing buttons. `data-testid="task-delete-btn"`.
- **Group leave button**: Always visible small icon button on each group list item in the sidebar. `data-testid="group-leave-btn"`. (Always visible to support touch/mobile — consistent with project's `touch-target` patterns.)
- Confirmations use a new `AlertDialog` component from shadcn/ui. Add `src/components/ui/alert-dialog.tsx` as part of this feature (Radix `@radix-ui/react-alert-dialog` is already available transitively). Confirmation buttons: `data-testid="task-delete-confirm"` and `data-testid="group-leave-confirm"`.
- Use `lucide-react` icons: `Trash2` for delete task, `LogOut` for leave group.
- Error on `leaveGroup()` failure: show inline `<p className="text-destructive">` within GroupManager (matching existing error display pattern there). No toast library needed.

## Acceptance Criteria

- AC-001 [e2e]: A "Delete" button (`data-testid="task-delete-btn"`) appears on each task card
- AC-002 [e2e]: Clicking Delete opens a confirmation dialog; dismissing it does not remove the task
- AC-003 [e2e]: Confirming deletion (`data-testid="task-delete-confirm"`) removes the task from the board
- AC-004 [unit]: The `task.deleted` event is dispatched with correct `taskId`, `updatedAt`, `updatedBy` (covered by existing reducer tests + dispatch integration)
- AC-005 [e2e]: A "Leave" button (`data-testid="group-leave-btn"`) appears on each group item in the sidebar
- AC-006 [e2e]: Clicking Leave opens a confirmation dialog; dismissing it keeps the group in the sidebar
- AC-007 [unit/integration]: Confirming leave calls `client.leaveGroup()` and `clearEvents(groupId)` (clearEvents sets the event array to [], which is sufficient)
- AC-008 [e2e]: After leaving a selected group, the board view is cleared (no group selected)
- AC-009 [e2e]: If `leaveGroup()` fails, an inline error is shown in GroupManager and the group remains listed

## Out of Scope

- Deleting tasks from other members' perspectives (that's handled by MLS broadcast)
- Admin-only delete restrictions
- Undo/redo for deletions

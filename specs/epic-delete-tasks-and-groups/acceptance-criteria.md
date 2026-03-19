# Acceptance Criteria: Delete Tasks and Groups

Generated: 2026-03-19T00:00:00Z
Source: spec.md

## Criteria

### AC-001 [e2e]: Delete button visible on task card
- **Description**: Every task card on the board has a visible Delete button (`data-testid="task-delete-btn"`) with a Trash2 icon.
- **Verification**: After creating a task, locate `[data-testid="task-delete-btn"]` within the task card; assert it is visible.
- **Type**: e2e

### AC-002 [e2e]: Delete confirmation dialog prevents accidental deletion
- **Description**: Clicking the Delete button opens a confirmation AlertDialog. Dismissing (Cancel) does not remove the task.
- **Verification**: Click `[data-testid="task-delete-btn"]`; assert dialog appears; click Cancel; assert task title still present in `[data-column="open"]`.
- **Type**: e2e

### AC-003 [e2e]: Confirming deletion removes task from board
- **Description**: After confirming deletion (`data-testid="task-delete-confirm"`), the task disappears from the board immediately.
- **Verification**: Click `[data-testid="task-delete-btn"]`; click `[data-testid="task-delete-confirm"]`; assert task title is no longer present in any `[data-column]` within 10 s.
- **Type**: e2e

### AC-004 [unit]: task.deleted event dispatched with correct fields
- **Description**: The `task.deleted` event dispatched by Board has `type: "task.deleted"`, correct `taskId`, a valid UNIX timestamp `updatedAt`, and `updatedBy` set to the current user's pubkey.
- **Verification**: Unit test: create a task in state, call handleDelete(taskId), verify dispatch was called with a correctly shaped TaskDeletedEvent. Existing reducer tests cover accept/reject paths.
- **Type**: unit

### AC-005 [e2e]: Leave button visible on each group item
- **Description**: Every group item in the sidebar has a visible Leave button (`data-testid="group-leave-btn"`) with a LogOut icon. The button is always visible (not hover-only).
- **Verification**: After creating a group, locate `[data-testid="group-leave-btn"]` within the sidebar group item; assert it is visible.
- **Type**: e2e

### AC-006 [e2e]: Leave confirmation dialog prevents accidental leave
- **Description**: Clicking the Leave button opens a confirmation AlertDialog. Dismissing (Cancel) keeps the group in the sidebar.
- **Verification**: Click `[data-testid="group-leave-btn"]`; assert dialog appears; click Cancel; assert group name still visible in sidebar.
- **Type**: e2e

### AC-007 [unit/integration]: Confirming leave calls leaveGroup() and clears local events
- **Description**: On confirmation, `client.leaveGroup(groupId)` is called and `clearEvents(groupId)` is called (setting the local event array to `[]`).
- **Verification**: Integration: mock `client.leaveGroup` and `clearEvents`; confirm leave; assert both were called with the correct groupId.
- **Type**: unit/integration

### AC-008 [e2e]: Leaving the selected group clears the board
- **Description**: After confirming leave for the currently selected group, the board view is no longer shown (no group selected state).
- **Verification**: Create group, select it (board heading visible), click leave + confirm; assert board heading for Tasks is no longer visible OR a "no group selected" message appears.
- **Type**: e2e

### AC-009 [e2e]: leaveGroup() failure shows inline error, group remains
- **Description**: If `client.leaveGroup()` throws, an inline error message is displayed in GroupManager and the group remains in the sidebar.
- **Verification**: This path is verified by unit/integration test with mock throwing; E2E coverage is limited to happy path.
- **Type**: unit/integration

## E2E Test Plan

### Scenario 1: Delete a task
1. Start Docker Compose relay (`docker-compose.e2e.yml`)
2. Playwright authenticates via bunker
3. Create a group and a task
4. Click `[data-testid="task-delete-btn"]` on the task card
5. Assert confirmation dialog appears
6. Click Cancel — assert task still present
7. Click delete button again → click `[data-testid="task-delete-confirm"]`
8. Assert task is gone from `[data-column="open"]` within 10 s

### Scenario 2: Leave a group
1. Start Docker Compose relay (`docker-compose.e2e.yml`)
2. Playwright authenticates via bunker
3. Create a group, assert it appears in sidebar
4. Click `[data-testid="group-leave-btn"]` for that group
5. Assert confirmation dialog appears
6. Click Cancel — assert group still in sidebar
7. Click leave button again → click `[data-testid="group-leave-confirm"]`
8. Assert group name no longer in sidebar and board is deselected

## Verification Plan

1. **Unit tests** (via `make test`): Cover task.deleted event shape (AC-004) and leaveGroup+clearEvents call (AC-007/AC-009) using Vitest with mocked dependencies.
2. **E2E tests** (via `make e2e`): Add test cases to `e2e/tests/tasks.spec.ts` (delete task) and `e2e/tests/groups.spec.ts` (leave group) following existing patterns (isMobile guard, .first() on locators, 15-30 s timeouts for async operations).
3. **AlertDialog component**: Added as `src/components/ui/alert-dialog.tsx` using the Radix primitive already present in node_modules.

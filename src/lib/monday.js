import mondaySdk from "monday-sdk-js";
import { settingsApi } from "../api/client";

const monday = mondaySdk();

export const initMonday = () => {
  monday.setApiVersion("2024-01");
  console.log("Monday SDK initialized");
};

export const getContext = async () => {
  const context = await monday.get("context");
  console.log("Context:", context);
  return context;
};

export const getSessionToken = async () => {
  try {
    const res = await monday.get("sessionToken");
    return res.data;
  } catch (err) {
    console.error("Failed to get session token", err);
    throw err;
  }
};

export const listenToContext = (callback) => {
  return monday.listen("context", callback);
};

export const listenToTheme = (callback) => {
  return monday.listen("theme", callback);
};

export const openItem = (itemId) => {
  return monday.execute("openItemCard", { itemId });
};

export const openLinkInTab = (url) => {
  return monday.execute("openLinkInTab", { url });
};

export const showConfirmation = (message) => {
  return monday.execute("confirm", { message });
};

export const queryMonday = async (query, variables = {}) => {
  const res = await monday.api(query, { variables });

  if (res.errors?.length) {
    throw new Error(res.errors[0].message);
  }

  return res.data;
};

/**
 * Returns the current workspace id from context.
 */
export const getWorkspaceId = async () => {
  const context = await getContext();

  const workspaceId = context?.data?.workspaceId ?? context?.data?.workspace_id;

  if (!workspaceId) {
    throw new Error(
      "Workspace ID not found in monday context. Ensure the app is running as a Workspace App.",
    );
  }

  return workspaceId;
};

/**
 * Fetch boards belonging ONLY to the current workspace.
 */
export const fetchBoards = async () => {
  const workspaceId = await getWorkspaceId();

  const data = await queryMonday(
    `
    query ($workspaceIds: [ID]) {
      boards(workspace_ids: $workspaceIds) {
        id
        name
        type
      }
    }
    `,
    { workspaceIds: [workspaceId] },
  );

  // type === "sub_items_board" is monday.com's API-level identifier for internal
  // subitem boards. These are never shown in the sidebar and must not be selectable.
  // board_kind (public/private/share) is NOT reliable — subitem boards return the
  // same board_kind as their parent board.
  return (data.boards ?? []).filter((b) => b.type !== "sub_items_board");
};

// export const fetchBoardItems = async (boardId) => {
//   const data = await queryMonday(
//     `
//     query ($boardId: ID!) {
//       boards(ids: [$boardId]) {
//         items_page(limit: 50) {
//           items {
//             id
//             name
//             subitems {
//               id
//               name
//             }
//           }
//         }
//       }
//     }
//     `,
//     { boardId },
//   );

//   return data.boards?.[0]?.items_page?.items ?? [];
// };

// export const createSubitem = async (parentItemId, itemName) => {
//   const data = await queryMonday(
//     `
//     mutation ($parentItemId: ID!, $itemName: String!) {
//       create_subitem(
//         parent_item_id: $parentItemId
//         item_name: $itemName
//       ) {
//         id
//         name
//       }
//     }
//     `,
//     { parentItemId, itemName },
//   );

//   return data.create_subitem;
// };

export const fetchAutomationBoards = async (workspaceId) => {
  return settingsApi.get(workspaceId);
};

export const addAutomationBoard = async (workspaceId, board, currentSettings) => {
  const updatedBoards = [
    ...(currentSettings?.boards ?? []),
    { board_id: parseInt(board.id), board_name: board.name, board_enabled: false },
  ];
  return settingsApi.save(workspaceId, {
    sensitivity: currentSettings?.sensitivity,
    automation_enabled: currentSettings?.automation_enabled,
    boards: updatedBoards,
  });
};

export const updateAutomationBoard = async (workspaceId, boardId, enabled, currentSettings) => {
  const updatedBoards = (currentSettings?.boards ?? []).map((b) =>
    b.board_id === boardId ? { ...b, board_enabled: enabled } : b,
  );
  return settingsApi.save(workspaceId, {
    sensitivity: currentSettings?.sensitivity,
    automation_enabled: currentSettings?.automation_enabled,
    boards: updatedBoards,
  });
};

export const removeAutomationBoard = async (workspaceId, boardId, currentSettings) => {
  const updatedBoards = (currentSettings?.boards ?? []).filter(
    (b) => b.board_id !== boardId,
  );
  return settingsApi.save(workspaceId, {
    sensitivity: currentSettings?.sensitivity,
    automation_enabled: currentSettings?.automation_enabled,
    boards: updatedBoards,
  });
};

export default monday;

import mondaySdk from 'monday-sdk-js'

const monday = mondaySdk()

export const initMonday = () => {
  monday.setApiVersion('2024-01')
}

export const getContext = () => monday.get('context')

export const getSessionToken = () => monday.get('sessionToken')

export const listenToContext = (callback) => {
  monday.listen('context', callback)
}

export const listenToTheme = (callback) => {
  monday.listen('theme', callback)
}

export const openItem = (itemId) => {
  monday.execute('openItemCard', { itemId })
}

export const openLinkInTab = (url) => {
  monday.execute('openLinkInTab', { url })
}

export const showConfirmation = (message) => {
  return monday.execute('confirm', { message })
}

export const queryMonday = async (query, variables = {}) => {
  const res = await monday.api(query, { variables })
  if (res.errors) throw new Error(res.errors[0]?.message || 'monday.com API error')
  return res.data
}

export const fetchBoards = async () => {
  const data = await queryMonday(`
    query {
      boards(limit: 100, order_by: created_at) {
        id
        name
      }
    }
  `)
  return data.boards
}

export const fetchBoardItems = async (boardId) => {
  const data = await queryMonday(`
    query($boardId: ID!) {
      boards(ids: [$boardId]) {
        items_page(limit: 50) {
          items {
            id
            name
            subitems {
              id
              name
            }
          }
        }
      }
    }
  `, { boardId })
  return data.boards?.[0]?.items_page?.items ?? []
}

export const createSubitem = async (parentItemId, itemName) => {
  const data = await queryMonday(`
    mutation($parentItemId: ID!, $itemName: String!) {
      create_subitem(parent_item_id: $parentItemId, item_name: $itemName) {
        id
        name
      }
    }
  `, { parentItemId, itemName })
  return data.create_subitem
}

export default monday

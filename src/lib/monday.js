import mondaySdk from 'monday-sdk-js'

const monday = mondaySdk()

export const initMonday = () => {
  const res = monday.setApiVersion('2024-01')
  console.log('initMonday called, response:', res)
  return res
}

export const getContext = () => {
  const res = monday.get('context')
  console.log('getContext called, response:', res)
  return res
}

export const getSessionToken = () => {
  const res = monday.get('sessionToken')
  console.log('getSessionToken called, response:', res)
  return res
}

export const listenToContext = (callback) => {
  const res = monday.listen('context', callback)
  console.log('listenToContext called, response:', res)
  return res
}

export const listenToTheme = (callback) => {
  const res = monday.listen('theme', callback)
  console.log('listenToTheme called, response:', res)
  return res
}

export const openItem = (itemId) => {
  const res = monday.execute('openItemCard', { itemId })
  console.log('openItem called, response:', res)
  return res
}

export const openLinkInTab = (url) => {
  const res = monday.execute('openLinkInTab', { url })
  console.log('openLinkInTab called, response:', res)
  return res
}

export const showConfirmation = (message) => {
  const res = monday.execute('confirm', { message })
  console.log('showConfirmation called, response:', res)
  return res
}

export const queryMonday = async (query, variables = {}) => {
  const res = await monday.api(query, { variables })
  console.log('queryMonday called, response:', res)
  if (res.errors) throw new Error(res.errors[0]?.message || 'monday.com API error')
  return res.data
}

export const fetchBoards = async () => {
  const data = await queryMonday(`
    query {
      boards(limit: 100) {
        id
        name
      }
    }
  `)
  console.log('fetchBoards called, response:', data)
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
  console.log('fetchBoardItems called, response:', data)
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
  console.log('createSubitem called, response:', data)
  return data.create_subitem
}

export default monday

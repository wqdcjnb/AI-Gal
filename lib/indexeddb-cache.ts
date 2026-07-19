/**
 * IndexedDB 缓存层 — 替代 localStorage 存储大对象（项目数据、角色、立绘组合）
 *
 * localStorage 仅保留 UI 状态（主题、缩放、侧边栏等），容量 5MB 且同步阻塞
 */
const DB_NAME = 'ai-gal-cache'
const DB_VERSION = 2
const STORE_NAME = 'project-data'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      if (req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.deleteObjectStore(STORE_NAME)
      }
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function putProject(id: string, data: any): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(data, `project-${id}`)
    tx.objectStore(STORE_NAME).put(data.characters, `characters-${id}`)
    tx.objectStore(STORE_NAME).put(data.savedCombos || {}, `combos-${id}`)
    tx.objectStore(STORE_NAME).put(data.subSections || {}, `subs-${id}`)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function getProject(id: string) {
  const db = await openDB()
  return new Promise<any>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const projReq = tx.objectStore(STORE_NAME).get(`project-${id}`)
    const charsReq = tx.objectStore(STORE_NAME).get(`characters-${id}`)
    const combosReq = tx.objectStore(STORE_NAME).get(`combos-${id}`)
    const subsReq = tx.objectStore(STORE_NAME).get(`subs-${id}`)
    tx.oncomplete = () => {
      db.close()
      resolve({
        project: projReq.result || null,
        characters: charsReq.result || [],
        combos: combosReq.result || {},
        subSections: subsReq.result || {},
      })
    }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function removeProject(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(`project-${id}`)
    tx.objectStore(STORE_NAME).delete(`characters-${id}`)
    tx.objectStore(STORE_NAME).delete(`combos-${id}`)
    tx.objectStore(STORE_NAME).delete(`subs-${id}`)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function putUIState(key: string, value: any): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(value, `ui-${key}`)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function getUIState(key: string): Promise<any> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(`ui-${key}`)
    tx.oncomplete = () => { db.close(); resolve(req.result ?? null) }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

'use client'

import { useProject } from '@/app/editor/_components/project-provider'

export function DeleteConfirmationDialogs() {
  const {
    deleteConfirmId,
    cancelDelete,
    confirmDeleteChapter,
  } = useProject()

  return (
    <>
      {/* Chapter Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
            <p className="mt-2 text-sm text-gray-600">
              确定要删除这个章节吗？删除后可以在 5 秒内撤销。
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteChapter}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

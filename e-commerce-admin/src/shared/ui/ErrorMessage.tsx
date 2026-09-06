import { Card, CardContent } from "./Card";

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  title = "Ошибка загрузки данных",
  message = "Произошла ошибка при загрузке данных. Пожалуйста, попробуйте обновить страницу.",
  onRetry,
}: ErrorMessageProps) {
  return (
    <Card className="border-red-100 bg-red-50/50">
      <CardContent className="pt-0">
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">{title}</h3>
          <p className="text-red-700 mb-6 max-w-md">{message}</p>
          <button
            onClick={onRetry || (() => window.location.reload())}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Обновить страницу
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

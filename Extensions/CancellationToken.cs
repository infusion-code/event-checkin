using System.Threading.Tasks;

namespace System.Threading
{
    internal static class TaskHelper
    {
        #region Fields
        private static Task _completedTask = Task.FromResult(true);
        #endregion

        #region Methods
        internal static Task GetCompletedTask()
        {
            return _completedTask;
        }

        internal static Task WaitAsync(this CancellationToken cancellationToken)
        {
            TaskCompletionSource<bool> cancelationTaskCompletionSource = new TaskCompletionSource<bool>();
            cancellationToken.Register(taskCompletionSource => ((TaskCompletionSource<bool>)taskCompletionSource).SetResult(true), cancelationTaskCompletionSource);

            return cancellationToken.IsCancellationRequested ? _completedTask : cancelationTaskCompletionSource.Task;
        }
        #endregion
    }
}
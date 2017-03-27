using System.Threading.Tasks;

namespace System.Threading
{
    /// <summary>
    /// Extension methods to facilitate server sent events. 
    /// </summary>
    internal static class TaskHelper
    {
        /// field declarations
        private static Task _completedTask = Task.FromResult(true);


        /// <summary>
        /// Returns a completed task. 
        /// </summary>
        /// <returns>Task object representing a completed task.</returns>
        internal static Task GetCompletedTask()
        {
            return _completedTask;
        }

        /// <summary>
        /// Provides for asyncronous waiting for a cancellationToken to wait for task cancellation (or completion)
        /// </summary>
        /// <returns>Task to be used to sync execution flow</returns>
        internal static Task WaitAsync(this CancellationToken cancellationToken)
        {
            TaskCompletionSource<bool> cancelationTaskCompletionSource = new TaskCompletionSource<bool>();
            cancellationToken.Register(taskCompletionSource => ((TaskCompletionSource<bool>)taskCompletionSource).SetResult(true), cancelationTaskCompletionSource);

            return cancellationToken.IsCancellationRequested ? _completedTask : cancelationTaskCompletionSource.Task;
        }

    }
}
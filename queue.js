import fc from './fetchInterceptor';

// the http requests which are on the way (waiting for responses)
const pendingTasks = [];
// the http requests which are real tasks in the queue
// all other callbacks will not creat a new queue, instead, it will put into the callback list in the existing queue.
// this will automatically execute once the pendingTaks is done.
const queuedTasks = [];

// please note: you should use this only for http get
// basically, for http get, you put a url and callback (success/fail) into it
// it will automatically combine all the callbacks in the next http request
export function joinQueue(url, success, fail) {
  window.pendingTasks = pendingTasks;
  window.queuedTasks = queuedTasks;

  enqueue(url, success, fail);
  runAvailableTasks();
}

function runAvailableTasks() {
  // if not in pending list, they are ready
  var readyTasks = queuedTasks.filter(q => !pendingTasks.find(p => p.url === q.url));

  readyTasks.forEach(task => {
    // running and put them into pending queue
    console.log('run ready task:', task);
    var promise = fc.get(task.url);
    var pending = {
      url: task.url,
      method: task.method,
    };

    // add into pending tasks
    pendingTasks.push(pending);

    // make promise run all
    promise
      .then((data) => {
        // console.log('result from task ', pending.url, data);
        removeElement(pendingTasks, pending);
        if (task.successes.length > 1) {
          console.log('will run all ' + task.successes.length + ' callbacks');
        }
        task.successes.forEach(success => success(data));
        runAvailableTasks();
      })
      .catch((e) => {
        removeElement(pendingTasks, pending);
        task.fails.forEach(fail => fail(e));
        runAvailableTasks();
      });

    // remove from queued tasks
    removeElement(queuedTasks, task);
  });
}

function enqueue(url, success, fail) {
  var task = queuedTasks.find(p => p.url === url);

  // if does not exist
  if (task === undefined) {
    task = {
      url: url,
      method: 'get',
      successes: [success],
      fails: fail ? [fail] : []
    };
    queuedTasks.push(task);
    // console.log('created new queued task', task);
  }
  else {
    task.successes.push(success);
    task.fails.push(fail);
    console.log('put existing queued task', task);
  }
}

function removeElement(list, item) {
  const index = list.indexOf(item);
  if (index >= 0) {
    list.splice(index, 1);
  }
}

var argv = require('minimist')(process.argv.slice(2));
var path = require('path');

function loadTask (gulp, taskName, taskPath) {
  try {
    var taskFunc = require(taskPath);
  } catch (e) {
    throw new Error ('could not load task "' + taskName + '"');
  }

  if (taskFunc.private) {
    return;
  }

  if (!taskFunc.dependencies) {
    taskFunc.dependencies = [];
  }

  taskFunc.dependencies.forEach(function (depPath) {
    var depRealPath = path.join(path.dirname(taskPath), depPath);
    try {
      loadTask(gulp, depPath, depRealPath);
    } catch (e) {
      throw new Error('could not load task dependency "' + depPath + '" for "' + taskName + '"');
    }
  });

  gulp.task(taskName, taskFunc.dependencies, function () {
    return taskFunc(argv);
  });
}

module.exports = function (options) {
  options = options || {};
  var bases = options.base || './';
  var gulp = options.gulp || require('gulp');
  var tasks = argv._;

  if (typeof bases === 'string') {
    bases = [bases];
  }

  tasks.forEach(function (taskName) {
    bases.forEach(function (basePath) {
      var taskPath = path.join(process.cwd(), basePath, taskName);
      try {
        loadTask(gulp, taskName, taskPath);
      } catch (e) {
        throw e;
      }
    });
  });
};

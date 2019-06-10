(function () {
  // 'use strict';
  
  var $form_add_task = $('.add-task'),
      $delete_task,
      // new_task = {},
      task_list = [];

  init();

  $form_add_task.on('submit', function (e) {
    var new_task = {};
    // 禁用默认行为
    e.preventDefault();
    new_task.content = $(this).find('input[name=content]').val();
    if (!new_task.content) return;
    if (add_task(new_task)) {
      $(this).find('input[name=content]').val('');
    }
    console.log(task_list);
  });

  function listen_task_delete() {
    $delete_task.on('click', function () {
      var $item = $(this).parent();
      confirm('确定删除？') ? delete_task($item.data('index')) : null;
      refresh_task_list();
    });
  }

  function refresh_task_list() {
    store.set('task_list', task_list);
    render_task_list();
    listen_task_delete();
  }

  function delete_task(index) {
    if (index === undefined || !task_list[index]) {
      return;
    }
    delete task_list[index];
  }

  function render_task_item(data, index) {
    if (!data || index === undefined) return;
    var list_item_template = `
        <div class="task-item" data-index=${index}>
          <span><input type="checkbox"></span>
          <span class="task-content">${data.content}</span>
          <span class="detail"></span>
          <span class="action"> 详细</span>
          <span class="action delete"> 删除</span>
        </div>`;
    return $(list_item_template);
  }

  function render_task_list() {
    $('.task-list').html('');
    for (var i = 0; i < task_list.length; i++) {
      var $task = render_task_item(task_list[i], i);
      $('.task-list').append($task);
    }
    $delete_task = $('.action.delete');
  }

  function add_task(new_task) {
    task_list.push(new_task);
    refresh_task_list();
    return true;
  }

  function init() {
    task_list = store.get('task_list') || [];
    refresh_task_list();
  }

})();
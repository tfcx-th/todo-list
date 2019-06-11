(function () {
  // 'use strict';
  
  var $form_add_task = $('.add-task'),
      $delete_task_trigger,
      $detail_task_trigger,
      $task_detail = $('.task-detail'),
      $task_detail_mask = $('.task-detail-mask'),
      $task_detail_content,
      currentIndex,
      $update_form,
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
  });

  $task_detail_mask.on('click', hide_task_detail);

  function listen_task_detail() {
    $detail_task_trigger.on('click', function () {
      var $item = $(this).parent();
      show_task_detail($item.data('index'));
    });
    $('.task-item').on('dblclick', function () {
      show_task_detail($(this).data('index'));
    })
  }

  function show_task_detail(index) {
    render_task_detail(index);
    currentIndex = index;
    $task_detail.show();
    $task_detail_mask.show();
  }

  function update_task(index, data) {
    if (index === undefined || !task_list[index]) return;
    task_list[index] = data;
    console.log(index,store.get('task_list'))
    refresh_task_list();
  }

  function render_task_detail(index) {
    if (index === undefined || !task_list[index]) return;
    var item = task_list[index];
    var template = 
      `<form>
        <div class="content">
          <div class="task-detail-content">${item.content}</div>
          <input type="text" name="content" value="${item.content}">
        </div>
        <div class="desc">
          <div class="task-detail-desc">${item.desc || ''}</div>
          <textarea name="desc">${item.desc || ''}</textarea>
        </div>
        <div class="remind">
          <input name="remind_date" type="date" value="${item.remind_date}">
        </div>
        <button type="submit">更新</button>
      </form>`;
    $task_detail.html('');
    $task_detail.html(template);

    $update_form = $task_detail.find('form');

    $task_detail_content = $update_form.find('.task-detail-content');
    $task_detail_content.on('dblclick', function () {
      $task_detail_content.hide();
      $update_form.find('[name=content]').show();
    })

    $task_detail_desc = $update_form.find('.task-detail-desc')
    if ($task_detail_desc.text()) {
      $update_form.find('[name=desc]').hide();
    } else {
      $task_detail_desc.hide();
      $update_form.find('[name=desc]').show();
    }
    $task_detail_desc.on('dblclick', function () {
      $task_detail_desc.hide();
      $update_form.find('[name=desc]').show();
    })

    $update_form.on('submit', function (e) {
      e.preventDefault();
      var data = {};
      data.content = $(this).find('[name=content]').val();
      data.desc = $(this).find('[name=desc]').val();
      data.remind_date = $(this).find('[name=remind_date]').val();
      update_task(index, data);
      hide_task_detail();
    })
  }

  function hide_task_detail() {
    $task_detail.hide();
    $task_detail_mask.hide();
  }

  function listen_task_delete() {
    $delete_task_trigger.on('click', function () {
      var $item = $(this).parent();
      confirm('确定删除？') ? delete_task($item.data('index')) : null;
      refresh_task_list();
    });
  }

  function refresh_task_list() {
    store.set('task_list', task_list);
    render_task_list();
    listen_task_delete();
    listen_task_detail();
  }

  function delete_task(index) {
    if (index === undefined || !task_list[index]) {
      return;
    }
    delete task_list[index];
  }

  function render_task_item(data, index) {
    if (!data || index === undefined) return;
    var list_item_template = 
      `<div class="task-item" data-index=${index}>
        <span><input type="checkbox"></span>
        <span class="task-content">${data.content}</span>
        <span class="action detail"> 详细</span>
        <span class="action delete"> 删除</span>
      </div>`;
    return $(list_item_template);
  }

  function render_task_list() {
    $('.task-list').html('');
    for (var i = 0; i < task_list.length; i++) {
      var $task = render_task_item(task_list[i], i);
      $('.task-list').prepend($task);
    }
    $delete_task_trigger = $('.action.delete');
    $detail_task_trigger = $('.action.detail');
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
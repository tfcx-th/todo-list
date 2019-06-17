(function () {
  // 'use strict';
  
  var $form_add_task = $('.add-task'),
      $delete_task_trigger,
      $detail_task_trigger,
      $task_detail = $('.task-detail'),
      $task_detail_mask = $('.task-detail-mask'),
      $task_detail_content,
      $checkbox_complete,
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
    task_list[index] = $.extend({}, task_list[index], data);
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
          <label>提醒时间</label>
          <input class="datetime" name="remind_date" type="text" value="${item.remind_date || ''}">
        </div>
        <button type="submit">更新</button>
      </form>`;
    $task_detail.html('');
    $task_detail.html(template);
    
    $('.datetime').datetimepicker();

    $update_form = $task_detail.find('form');

    $task_detail_content = $update_form.find('.task-detail-content');
    $task_detail_content.on('click', function () {
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
    $task_detail_desc.on('click', function () {
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
      pop('确定删除？').then(function (r) {
        r ? delete_task($item.data('index')) : null;
        refresh_task_list();
      });
    });
  }

  function listen_checkbox_complete() {
    $checkbox_complete.on('click', function () {
      var $this = $(this).parent().parent();
      var index = $this.data('index');
      var item = store.get('task_list')[index];
      if (item && item.complete) {
        update_task(index, { complete: false });
      } else {
        update_task(index, { complete: true });
      }
    })
  }

  function refresh_task_list() {
    store.set('task_list', task_list);
    render_task_list();
    listen_task_delete();
    listen_task_detail();
    listen_checkbox_complete();
  }

  function delete_task(index) {
    if (index === undefined || !task_list[index]) {
      return;
    }
    console.log(1)
    delete task_list[index];
  }

  function pop(arg) {
    if (!arg) {
      console.error('pop title is required');
    }

    var conf = {}, $box, $mask;
    var dfd = $.Deferred();

    if (typeof arg == 'string') {
      conf.title = arg;
    } else {
      conf = $.extend(conf, arg);
    }

    $box = $(`<div>
      <div class="pop-title">${conf.title}</div>
      <div class="pop-content">
        <button class="pop-btn confirm">确定</button>
        <button class="cancel">取消</button>
      </div>
    </div>`).css({
      position: 'fixed',
      'padding-top': '10px',
      width: 250,
      height: 150,
      'border-radius': 3,
      color: '#000',
      background: '#fff',
      'box-shadow': '0 1px 2px rgba(0, 0, 0, 0.5)'
    });

    $title = $box.find('.pop-title').css({
      padding: '15px 10px',
      'font-size': 20,
      'font-weight': 900,
      'text-align': 'center'
    });

    $content = $box.find('.pop-content').css({
      padding: '0px 10px',
      'font-weight': 900,
      'text-align': 'center'
    });

    var $confirm = $content.find('button.confirm'),
        confirmed;

    var timer = setInterval(function () {
      if (confirmed !== undefined) {
        dfd.resolve(confirmed);
        clearInterval(timer);
        dismiss_pop();
      }
    }, 50);

    function dismiss_pop() {
      $mask.remove();
      $box.remove();
    }

    $confirm.on('click', function () {
      confirmed = true;
    });    

    var $cancel = $content.find('button.cancel').css({
      background: '#aaa'
    });

    $cancel.on('click', function () {
      confirmed = false;
    })

    $mask = $('<div></div>').css({
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(0, 0, 0, 0.5)'
    });

    $mask.on('click', function () {
      confirmed = false;
    })

    function adjust_box_position() {
      var window_width = $(window).width(),
          window_height = $(window).height(),
          box_wdith = $box.width(),
          box_height = $box.height();
      var move_x = (window_width - box_wdith) / 2,
          move_y = (window_height - box_height) / 2 - 80;
        
      $box.css({
        left: move_x,
        top: move_y
      });
    }

    $(window).on('resize', function () {
      adjust_box_position();
    });

    $mask.appendTo($('body'));
    $box.appendTo($('body'));
    adjust_box_position();
    
    return dfd.promise();
  }

  function render_task_item(data, index) {
    if (!data || index === undefined) return;
    var list_item_template = 
      `<div class="task-item" data-index=${index}>
        <span><input class="complete" ${data.complete ? 'checked' : ''} type="checkbox"></span>
        <span class="task-content">${data.content}</span>
        <span class="action detail"> 详细</span>
        <span class="action delete"> 删除</span>
      </div>`;
    return $(list_item_template);
  }

  function render_task_list() {
    $('.task-list').html('');
    var complete_items = [];
    for (var i = 0; i < task_list.length; i++) {
      if (task_list[i] && task_list[i].complete) {
        $task = render_task_item(task_list[i], i);
        $task.addClass('completed');
        $('.task-list').append($task);
      } else {
        var $task = render_task_item(task_list[i], i);
        $('.task-list').prepend($task);
      }      
    }

    $delete_task_trigger = $('.action.delete');
    $detail_task_trigger = $('.action.detail');
    $checkbox_complete = $('.task-list .complete');
  }

  function add_task(new_task) {
    task_list.push(new_task);
    refresh_task_list();
    return true;
  }

  function notify(content) {
    $('.msg').find('.msg-content').html(content)
    $('.msg').show();
  }

  function listen_msg_event() {
    $('.msg').find('button').on('click', function () {
      $('.msg').hide();
    })
  }

  function task_remind_check() {
    var current_timestamp, task_timestamp;
    var timer = setInterval(function () {
      for (var i = 0; i < task_list.length; i++) {
        var item = store.get('task_list')[i];

        if (!item || !item.remind_date || item.informed) continue;

        current_timestamp = (new Date()).getTime();
        task_timestamp = (new Date(item.remind_date)).getTime();

        if (current_timestamp - task_timestamp >= 1) {
          notify();
          update_task(i, { informed: true });
          notify();
        }
      }
    }, 500);
  }

  function init() {
    task_list = store.get('task_list') || [];
    listen_msg_event();
    refresh_task_list();
    task_remind_check();
  }

})();
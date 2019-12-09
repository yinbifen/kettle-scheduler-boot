$(document).ready(function () {
    // 资源库下拉列表
    getRepType();
    // 数据库类型下拉列表
    getDatabaseType();
    // 数据库访问类型
    getDatabaseAccessType();
    // 提交按钮监听
    submitListener();
    // 查询信息并显示
	initData();
});

function getDatabaseType() {
    $.ajax({
        type: 'GET',
        async: false,
        url: '/enum/databaseType.do',
        data: {},
        success: function (data) {
            var list = data.result;
            for (var i=0; i<list.length; i++){
                $("#dbType").append('<option value="' + list[i].code + '">' + list[i].value + '</option>');
            }
        },
        error: function () {
            alert("请求失败！请刷新页面重试");
        },
        dataType: 'json'
    });
}

function getRepType() {
    $.ajax({
        type: 'GET',
        async: false,
        url: '/enum/repositoryType.do',
        data: {},
        success: function (data) {
            var list = data.result;
            for (var i=0; i<list.length; i++){
                $("#repType").append('<option value="' + list[i].code + '">' + list[i].value + '</option>');
            }
        },
        error: function () {
            alert("请求失败！请刷新页面重试");
        },
        dataType: 'json'
    });
}

function getDatabaseAccessType() {
    $.ajax({
        type: 'GET',
        async: false,
        url: '/enum/databaseAccessType.do',
        data: {},
        success: function (data) {
            var list = data.result;
            for (var i=0; i<list.length; i++){
                $("#dbAccess").append('<option value="' + list[i].code + '">' + list[i].value + '</option>');
            }
        },
        error: function () {
            alert("请求失败！请刷新页面重试");
        },
        dataType: 'json'
    });
}

function testConnection(){
    // 获取表单数据
    var data = {};
    $.each($("form").serializeArray(), function (i, field) {
        data[field.name] = field.value;
    });

    var returnType = false;
    $.ajax({
        type: 'POST',
        async: false,
        url: '/sys/repository/testConnection.do',
        data: JSON.stringify(data),
        contentType: "application/json;charset=UTF-8",
        success: function (data) {
            if (data.success){
                returnType = true;
                layer.msg("连接成功", {icon: 6});
            }else {
                if (data.code === '0002') {
                    layer.msg(data.message, {icon: 5});
                } else {
                    layer.msg("连接失败，请检查参数重试", {icon: 5});
                }
            }
        },
        error: function () {
            layer.msg("连接失败，请检查参数重试", {icon: 5});
        },
        dataType: 'json'
    });
    return returnType;
}

function initData(){
	var repositoryId = $("#id").val();
	$.ajax({
        type: 'GET',
        async: true,
        url: '/sys/repository/getRepositoryDetail.do?id=' + repositoryId,
        data: {},
        success: function (data) {
            if (data.success) {
                var kRepository = data.result;
                $("#repName").val(kRepository.repName);
                $("#repType").find("option[value=" + kRepository.repType + "]").prop("selected",true);
                $("#repUsername").val(kRepository.repUsername);
                $("#repPassword").val(kRepository.repPassword);
                $("#repBasePath").val(kRepository.repBasePath);
                $("#dbType").find("option[value=" + kRepository.dbType + "]").prop("selected",true);
                $("#dbAccess").find("option[value=" + kRepository.dbAccess + "]").prop("selected",true);
                $("#dbHost").val(kRepository.dbHost);
                $("#dbPort").val(kRepository.dbPort);
                $("#dbName").val(kRepository.dbName);
                $("#dbUsername").val(kRepository.dbUsername);
                $("#dbPassword").val(kRepository.dbPassword);
            } else {
                layer.msg(data.message, {icon: 5});
            }
        },
        error: function () {
            alert("请求失败！请刷新页面重试");
        },
        dataType: 'json'
    });
}

function submitListener() {
    var icon = "<i class='fa fa-times-circle'></i> ";
    $("#RepositoryForm").validate({
        rules: {
            repName: {
                required: true,
                maxlength: 50
            },
            repType: {
                required: true
            },
            repUsername: {
                required: true,
                maxlength: 50
            },
            repPassword: {
                required: true,
                maxlength: 50
            }
        },
        messages: {
            repName: {
                required: icon + "请输入资源库名称",
                maxlength: icon + "资源库名称不能超过50个字符"
            },
            repType: {
                required: icon + "请选择资源库类型"
            },
            repUsername: {
                required: icon + "请输入登录资源库用户名",
                maxlength: icon + "登录资源库用户名不能超过50个字符"
            },
            repPassword: {
                required: icon + "请输入登录资源库密码",
                maxlength: icon + "登录资源库密码不能超过50个字符"
            }
        },
        // 提交按钮监听 按钮必须type="submit"
        submitHandler:function(form){
            // 获取表单数据
            var data = {};
            $.each($("form").serializeArray(), function (i, field) {
                data[field.name] = field.value;
            });
            //做判断
            if (testConnection()){
                $.ajax({
                    type: 'PUT',
                    async: false,
                    url: '/sys/repository/update.do',
                    data: JSON.stringify(data),
                    contentType: "application/json;charset=UTF-8",
                    success: function (res) {
                        if (res.success){
                            layer.msg('编辑成功',{
                                time: 1000,
                                icon: 6
                            });
                            // 成功后跳转到列表页面
                            setTimeout(function(){
                                location.href = "/web/repository/list.shtml";
                            },1000);
                        }else {
                            layer.msg(res.message, {icon: 2});
                        }
                    },
                    error: function () {
                        layer.msg(res.message, {icon: 5});
                    },
                    dataType: 'json'
                });
            }
        }
    });
}

$.validator.setDefaults({
    highlight: function (element) {
        $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
    },
    success: function (element) {
        element.closest('.form-group').removeClass('has-error').addClass('has-success');
    },
    errorElement: "span",
    errorPlacement: function (error, element) {
        if (element.is(":radio") || element.is(":checkbox")) {
            error.appendTo(element.parent().parent().parent());
        } else {
            error.appendTo(element.parent());
        }
    },
    errorClass: "help-block m-b-none",
    validClass: "help-block m-b-none"
});

function cancel(){
    location.href = "/web/repository/list.shtml";
}
;
(function(window, undefined){
  var imgCodeArr = [2432,7092,9746, 8182, 8463, 0864, 7199, 4631, 3322, 8555];
  var PAGE = PAGE || {};
  PAGE = {
    init: function() {
      this.bind();
      this.getImgCode();
      this.slideshow();
    },
    bind: function() {
      $('.submit').on('click', this.handleVerify);
      $('.telephone-text').on('focus', this.removeError);
      $('.send-code').on('click', this.handleSendCode);
      $('.imgcode-img').on('click',this.getImgCode);
    },
    imgCodeIndex: 0,
    smsLock: false,
    checkLock: false,
    smsId: null,
    pushData: {
      position: null,
      tel: 13000000000,
      name: null,
      type: 'M-2.0',
      location: window.location.href,
      referrer: document.referrer,
      hmsr: '',
    },
    slideshow:function(){
      var mySwiper = new Swiper ('.swiper-container', {
        loop: true, 
        pagination: {
          el: '.swiper-pagination',
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      })     
    },
    getImgCode: function() {
      let index = Math.floor(Math.random() * 10);
      PAGE.imgCodeIndex = index;
      $('.imgcode-img').attr('src','./img/verifyCode/verifyCode_' + (index+1) +'.png')
    },
    checkImgCode: function(imgCode) {
      let code = Number(imgCode);
      let resultCode = imgCodeArr[PAGE.imgCodeIndex];
      if(code === resultCode){
        return true
      }
    },
    handleSendCode: function() {
      if(PAGE.smsLock){
        return
      }

      let form = $(this).parents('form');
      let phone = form.find('.telephone-text').val().trim();
      let imgCode = form.find('.imgcode-input').val().trim();

      if(!PAGE.isMobile(phone)){
        let phoneInput = form.find('.error-message');
        phoneInput.text('请输入正确手机号');
        phoneInput.parent().addClass('error')
        return
      }

      if(!imgCode){
        alert('请输入图片验证码')
        return
      }

      if(!PAGE.checkImgCode(imgCode)){
        alert('图片错误验证码')
        return
      }

      //发送验证码
      PAGE.smsLock = true;
      $('.telephone-text').val(phone);
      $('.send-code').text('发送中～').addClass('active');
      $.ajax({
        url: 'https://www.lifetour.com.cn/api/v2/sms',
        type: 'POST',
        data: {
          phone: phone,
          sms_code: 'SMS_165416238',
        },
        success: function(res){
          if(res.code === 200){
            PAGE.smsId = res.data.id;
            PAGE.countDown();
          }else{
            alert(res.message);
            PAGE.smsLock = false;
          }
        },
        error: function() {
          alert('网络错误');
          PAGE.smsLock = false;
        }
      })
      
    },
    countDown: function() {
      let num = 60;
      let interval = setInterval(()=>{
        $('.send-code').text('( ' + num + ' s )');
        num --
        if(num === 0){
          clearInterval(interval);
          $('.send-code').text('重新获取').removeClass('active');
          PAGE.smsLock = false;
        }
      },1000)
    },
    handleVerify: function() {
      let id = PAGE.smsId;
      let form = $(this).parents('form');
      let phone = form.find('.telephone-text').val().trim();
      let code = form.find('.sms-code').val().trim();
      let imgCode = form.find('.imgcode-input').val().trim();

      if(PAGE.checkLock){
        return
      }

      if(!PAGE.isMobile(phone)){
        let phoneInput = form.find('.error-message');
        phoneInput.text('请输入正确手机号');
        phoneInput.parent().addClass('error')
        return
      }

      if(!id){
        alert('请进行手机验证');
        return
      }

      if(!code){
        alert('请输入手机验证码');
        return
      }

      if(!imgCode){
        alert('请输入图片验证码')
        return
      }

      if(!PAGE.checkImgCode(imgCode)){
        alert('图片错误验证码')
        return
      }
      
      PAGE.pushData.hmsr = PAGE.getQuery('hmsr');
      PAGE.pushData.position = $(this).data('pos');
      PAGE.pushData.tel = phone;
      // 验证码验证
      // console.log(code,phone,id);
      PAGE.checkLock = true;
      $.ajax({
        url: 'https://www.lifetour.com.cn/api/sms/check',
        type: 'POST',
        data: {
          id: id,
          phone: phone,
          code: code
        },
        success: function(res){
          if(res.code === 200){
            PAGE.handleSubmit(PAGE.pushData);
          }else{
            alert(res.message);
            PAGE.checkLock = false;
          }
        },
        error: function() {
          alert('网络错误');
          PAGE.checkLock = false;
        }
      })
      /* 数据提交*/
      /*PAGE.handleSubmit(PAGE.pushData);*/
      /*增加人数*/
      let numberPeople = $('.number-people').text();
      numberPeople = Number(numberPeople) ;
      numberPeople += 1
      $('.number-people').text(numberPeople);     
    },
    handleSubmit: function(data) {
      $.ajax({
        url: 'https://www.lifetour.com.cn/api/v2/ddjy',
        type: 'POST',
        data: data,
        success: function(res){
          if(res.code === 200){
            PAGE.checkLock = false;
            $('.success-container').fadeIn().siblings().fadeOut();
          }else{
            alert(res.message);
            PAGE.checkLock = false;
          }
        },
        error: function() {
          alert('网络错误');
          PAGE.checkLock = false;
        }
      })
    },
    removeError: function () {
      $(this).parent().removeClass('error');
    },
    getQuery:function(name) {
      var result = location.search.match(new RegExp("[\?\&]" + name+ "=([^\&]+)","i"));
      if(result == null || result.length < 1){
        return "";
      }
      return result[1];
    },
    isMobile: function(source) {
      return /^((\(\d{2,3}\))|(\d{3}\-))?(1[34578]\d{9})$/.test(source);
    },
    isEmtry: function (source) {
      source = $.trim(source);
      return source === ''? true: false;
    }
  }
  PAGE.init();

}(window));

/**
 * jquery plugin -- jquery.slider-validation.js
 * Description: a sliderValidation plugin based on jQuery
 * Version: 1.1.0
 * Author: Gu Shijie
 * created: February 26, 2020
 */

//避免全局污染 保证插件正常运行 提高性能 兼容性
;(function ($,window,document,undefined){
	/**
	 * 构造一个函数滑块
	 * @param element_wrapper append_obj style set_slide_block_option success
	 * @return 
	 */
	function SliderBlock(append_obj,style,success){//滑动的元素 样式列表 成功执行之后
		this.element_wrapper = false;
		this.success = this.checkFn(success) ? success : function(){};
		this.append_obj = this.checkElm(append_obj) ? append_obj : $('body');
		this.success_count = 0;
		//设置滑块css样式
		var style_wrapper = {
			position:"relative",
			top:"0px",
			left:"0px",
			slide_block_wrapper_width:"300px",
			slide_block_wrapper_height:"40px",
			slide_block_width:"50px",
			slide_block_height:"100%",
			margin:"0px 0px 0px 0px",
			slider_wrapper_zindex:10000,
			slider_wrapper_bg:"#e8e8e8",
			slider_bg:"rgb(255,255,255)",
			progress_bg:"rgb(255,184,0)",
			default_text:"请向右滑动滑块",
			default_text_color:"black",
			success_text_color:"white",
			default_text_font_size:"12px",
			success_show_text:"验证成功",
			success_slider_wrapper_bg:"rgb(76,175,80)",
			success_url_icon:"./images/ok.png",
			default_url_icon:"./images/right-arrow.png",
			box_shadow:"1px 1px 5px rgba(0,0,0,0.2)",
			border:"1px solid #ccc"
		};
		//合并后的对象参数
		this.style = $.extend(style_wrapper,style || {});
		//设置滑块的选项
		var set_slide_block_option = {
			min_left:0,
			max_left:parseInt(this.style.slide_block_wrapper_width) - parseInt(this.style.slide_block_width),
			is_ok:false,
			random:parseInt(Math.random()*(1000 - 100 + 1) + 100),
			elm_selector:null,
			elm_selector_string:null,
			is_down:false,
			is_up:false,
			this_slide_block_obj:null
		};
		//合并滑块参数
		// this.set_slide_block_option = $.extend(set_slide_block_option,set_slide_block_option || {});
		//当前点击的对象
		this.this_slide_block_obj = set_slide_block_option.this_slide_block_obj;
		//是否按下
		this.is_down = set_slide_block_option.is_down;
		//是否抬起
		this.is_up = set_slide_block_option.is_up;
		//是否滑动完毕
		this.is_ok = set_slide_block_option.is_ok;
		//完成后显示的文字
		this.success_show_text = style_wrapper.success_show_text;
		//最小距离左边的距离
		this.min_left = set_slide_block_option.min_left;
		//最大距离左边的距离
		this.max_left = set_slide_block_option.max_left;
		//随机生成 100 - 1000的数字 保证id class的唯一性 Math.random()*(max - minx + 1) + min
		this.random = set_slide_block_option.random;
		//wrapper选择器对象
		this.elm_selector = set_slide_block_option.elm_selector;
		//wrapper选择器字符串
		this.elm_selector_string = set_slide_block_option.elm_selector_string;
		//成功后的icon图标
		this.success_url_icon = style_wrapper.success_url_icon;
		//默认的icon图标
		this.default_url_icon = style_wrapper.default_url_icon;
		//成功之后的背景颜色
		this.success_slider_wrapper_bg = style_wrapper.success_slider_wrapper_bg;
		//成功之后的文字颜色
		this.success_text_color = style_wrapper.success_text_color;
		
		//生成滑块对象
		this.init();
	}
	/**
	 * 初始化滑块对象
	 */
	SliderBlock.prototype.init = function(){
		var slider_block = this;
		this.create_slider_block();
		$(document).on('mousedown',this.elm_selector_string + ' .sliding-block',function(e){
			var e = e || window.event || e.which;
			e.preventDefault();
			slider_block.this_slide_block_obj = $(this);//点击的滑块对象
			if(slider_block.this_slide_block_obj.position().left == 0){
				slider_block.is_up = false;//滑块是否抬起恢复默认值
			}
			slider_block.this_slide_block_obj.css({"left":this.min_left + "px","transition":"left 0s ease-in-out 0s"});//关闭动画
			slider_block.this_slide_block_obj.siblings('.current-progress-bg').css('transition','width 0s ease-in-out 0s');
			slider_block.mouse_down(e,'');//按下滑块
		});
		
	}
	
	/**
	 * 创建一个滑块对象
	 */
	SliderBlock.prototype.create_slider_block = function(){
		//创建元素包装的id
		this.elm_selector = this.element_wrapper ? this.element_wrapper : '#sliding-block-wrapper'+this.random+'';
		this.elm_selector.indexOf('#') != -1 ? this.append_obj.append('<div onselectstart="return false;" id="'+this.elm_selector.split('#')[1]+'"></div>') : this.append_obj.append('<div onselectstart="return false;" class="'+this.elm_selector.split('.')[1]+'"></div>');
		this.elm_selector_string = this.elm_selector;
		//创建好包装wrapper
		this.elm_selector = $(this.elm_selector);
		//创建文字
		this.elm_selector.append('<div class="sliding-block-text">请向右滑动滑块</div>');
		//创建进度背景
		this.elm_selector.append('<div class="current-progress-bg"></div>');
		//创建滑块
		this.elm_selector.append('<div class="sliding-block"><i style="width: 16px;height: 16px;display: inline-block;background-image: url('+this.default_url_icon+');background-size: 100% 100%;position: absolute;top: calc(50% - 8px);left: calc(50% - 8px);"></i></div>');
		//创建成功的图标显示
		this.elm_selector.append('<div class="successful-icon"></div>');
		//设置用户自定义样式
		this.set_custom_style(this.elm_selector,this.style);
		//设置用户不能自定义的样式
		this.set_default_style(this.elm_selector,this.style);
	};
	
	/**
	 * 设置用户可以自定义的样式
	 * @param wrapper style
	 */
	SliderBlock.prototype.set_custom_style = function(wrapper,style){
		//设置包装的wrapper css
		wrapper.css({
			"width":style.slide_block_wrapper_width,
			"height":style.slide_block_wrapper_height,
			"background-color":style.slider_wrapper_bg,
			"margin":style.margin,
			"position":style.position,
			"left":style.left,
			"top":style.top,
			"z-index":style.slider_wrapper_zindex,
			"box-shadow":style.box_shadow
		});
		//设置滑块的样式
		wrapper.find('.sliding-block').css({
			"width":style.slide_block_width,
			"height":style.slide_block_height,
			"background-color":style.slider_bg,
			"position":"absolute",
			"left":'0px',
			"top":'0px',
			"border":style.border
		});
		//设置进度背景颜色
		wrapper.find('.current-progress-bg').css({
			"width":'0px',
			"height":'100%',
			"background-color":style.progress_bg,
			"position":"absolute",
			"left":'0px',
			"top":'0px'
		});
		//设置文字内容和样式
		wrapper.find('.sliding-block-text').text(style.default_text);
		wrapper.find('.sliding-block-text').css({
			"color":style.default_text_color,
			"font-size":style.default_text_font_size
		});
	};
	
	/**
	 * 设置用户不可以自定义的样式
	 * @param wrapper style
	 */
	SliderBlock.prototype.set_default_style = function(wrapper,style){
		//设置包装的wrapper css
		wrapper.css({
			
		});
		//设置滑块的样式
		wrapper.find('.sliding-block').css({
			"z-index":"100",
			"cursor":"move",
			"height":"calc(100% - 2px)"
		});
		//设置进度背景颜色
		wrapper.find('.current-progress-bg').css({
			"position":"absolute",
			"left":'0px',
			"top":'0px'
		});
		//设置文字内容和样式
		wrapper.find('.sliding-block-text').css({
			"width":"100%",
			"height":"100%",
			"text-align":"center",
			"line-height":wrapper.innerHeight() + 'px',
			"z-index":"10",
			"position":"absolute",
			"left":'0px',
			"top":'0px'
		});
	};
	
	/**
	 * 按下滑块的时候
	 * @param 
	 */
	SliderBlock.prototype.mouse_down = function(e,type){
		var down_X = e.clientX;
		var slider_block = this;
		$(document).on({
			mousemove:function(e){//抬起的时候也会存在移动
				var e = e || window.event || e.which;
				 e.preventDefault();
				slider_block.mouse_move(e,down_X,'');
			},
			mouseup:function(e){
				var e = e || window.event || e.which;
				e.preventDefault();
				slider_block.mouse_up(e,'');
			}
		},'');
	};
	
	/**
	 * 移动滑块的时候
	 * @param 
	 */
	SliderBlock.prototype.mouse_move = function(e,down_X,type){
		//取消鼠标事件
		if(this.is_ok){//代表到达终点
			this.slider_success();
			return;
		}
		if(this.is_up){//代表已经抬起滑块了 禁止移动回到起始位置 并且未到达终点
			this.this_slide_block_obj.css({"left":this.min_left + "px","transition":"left 0.8s ease-in-out 0s"});
			this.this_slide_block_obj.siblings('.current-progress-bg').css('transition','width 0.8s ease-in-out 0s');
			this.current_progress_bg(this.min_left);
			return;
		}
		var move_X = e.clientX;
		var current_X = move_X - down_X;
		this.current_progress_bg(current_X);
		this.this_slide_block_obj.css('left',current_X + 'px');
		if(this.this_slide_block_obj.position().left < this.min_left){
			this.this_slide_block_obj.css('left',this.min_left + 'px');
			this.current_progress_bg(this.min_left);
		}
		if(this.this_slide_block_obj.position().left >= this.max_left){
			this.this_slide_block_obj.css('left',this.max_left + 'px');
			this.current_progress_bg(this.max_left);
			this.is_ok = true;
		}
	};
	
	/**
	 * 抬起滑块的时候
	 * @param 
	 */
	SliderBlock.prototype.mouse_up = function(e,type){
		if(this.is_ok){//代表到达终点
			this.is_up = false;
		}else{
			this.is_up = true;
		}
	};
	
	/**
	 * 进度条背景
	 * @param width
	 */
	SliderBlock.prototype.current_progress_bg = function(width){
		this.elm_selector.find('.current-progress-bg').css("width",width + "px");
	};
	
	/**
	 * 滑动结束 成功
	 * @param 
	 */
	SliderBlock.prototype.slider_success = function(){
		this.success_count += 1;
		if(this.success_count> 1){//限制执行次数 只执行一次
			return;
		}
		this.this_slide_block_obj.find('i').css('background-image','url('+this.success_url_icon+')');
		this.this_slide_block_obj.siblings('.current-progress-bg').css('background-color',this.success_slider_wrapper_bg);
		this.this_slide_block_obj.siblings('.sliding-block-text').text(this.success_show_text);
		this.this_slide_block_obj.siblings('.sliding-block-text').css('color',this.success_text_color);
		this.this_slide_block_obj.siblings('.current-progress-bg').css('transition','background-color 0.2s ease-in-out 0s');
		//移除添加的光表示事件
		this.off_event();
		//调用执行成功后的方法
		this.success();
	};
	
	/**
	 * 移除所有添加的光标事件
	 * @param  
	 * @return 
	 */
	SliderBlock.prototype.off_event = function(){
		$(document).off("mousemove");
		$(document).off("mouseup");
	}
	
	/**
	 * 检测是否传入的是一个元素
	 * @param elm 
	 * @return {boolean}
	 */
	SliderBlock.prototype.isElm = function(elm){
		if(elm.toString().indexOf('#') == -1 && elm.toString().indexOf('.') == -1){
			return false;
		}else{
			return true;
		}
	}
	
	/**
	 * 检测元素是否存在
	 * @param elm
	 * @returns {boolean}
	 */
	SliderBlock.prototype.checkElm = function (elm) {
	    if($(elm).length > 0){
	        return true;
	    }else{
	        throw "this element does not exist.";
	    }
	};
	
	/**
	 * 检测传入参数是否是function
	 * @param fn
	 * @returns {boolean}
	 */
	SliderBlock.prototype.checkFn = function (fn) {
	    if(typeof fn === "function"){
	        return true;
	    }else{
	        throw "the param is not a function.";
	    }
	};
	window['SliderBlock'] = SliderBlock;//添加到window对象上面 这样就能在外部获取了
	// window.SliderBlock = SliderBlock;//添加到window对象上面 这样就能在外部获取了
	//也可以通过外部的new
	SliderBlock.create = function(append_obj,style,success){
		return new SliderBlock(append_obj,style,success);
	}
})(jQuery, window, document);
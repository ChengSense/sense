# sense web mvvm framework

版本：1.2.0
 
特点：   

    小而美，无复杂的指令，模板既html代码，无违和感自然便于维护
    
功能：  

    1.支持小粒度的表达式控制  
    
    2.基于浏览器（非字符串拼接）的模板引擎  
    
    3.循环嵌套  
    
    4.逻辑判断  
    
    5.数据双向绑定   
    
    6.兼容jQuery
    
指令：

     循环 @each( 变量：数组||对象 ,{  
              你的业务逻辑   
          })   
          
          有内联关系的标签如：table > tbody > tr > td之间无法写文本的请用下面指令替代，适用一切标签之间
          
          <!@each( 变量：数组||对象 ,{> 
               你的业务逻辑
          <!})>
          
          或者   
          
          <div each="item:list">   
             {{index + item}}  
          </li>   
          
          说明： "index"为关键字是迭代的索引，不要随意定义在变量里
          
     条件 @when( 布尔表达式 ,{   
              你的业务逻辑   
          })
          
          或者   
          
          <div each="item:list">   
             {{index + item}}  
          </li>
示例：  
  js   ：   
  
    	define(function() {   
    		this.id = "3516";   
    		this.name = "chengdong";   
    		this.age = 27;   
    		this.list1 = [ 1, 2 ];   
    		this.list2 = [ 4, 5 ];  
    		this.list3 = [ 4, 5 ];  
    	});   
        
  html ：    
  
        @each(item1:list1,{  
    		<div id="{{id}}">  
    			@each(item2:list2,{   
    			    <br/>   
    			    {{item2}}. {{name}} : {{age}}   
    			    @when(true,{   
    			       <ul>   
    			         <li each="item1:list1">   
    			         {{name + item1}}   
    			         </li>   
    			       </ul>   
    			   })   
    			   {{age}}   
    			})   
    		</div>   
    	})   
    	<input type="text" value="{{name}}">    
    	<div>{{name}}</div>    
  完整示例：   
  
        <!DOCTYPE html>   
        <html>   
        	<head>  
        	<title>sense-index</title>  
        	<script type="text/javascript" src="../core.js"></script>  
        	<script type="text/javascript">  
        	ready(function() {  
        		define(function() {  
        			this.age = 27;  
        			this.name = "chengdong";  
        			this.list1 = [ 1, 2 ];  
        			this.list2 = [ 4, 5 ];  
        			this.list3 = [ 4, 5 ];
        		});   
        	})   
        	</script>   
        	</head>   
        <body>   
        	@each(item1:list1,{   
        		<div id="{{item1}}">   
        			@each(item2:list2,{   
        			    <br/>   
        			    {{item2}}. {{name}} : {{age}}   
        			    @when(true,{   
        			       <ul>   
        			         <li each="item1:list1">   
        			         {{name + item1}}   
        			         </li>   
        			       </ul>   
        			   })   
        			   {{age}}  
        			})   
        		</div>    
        	})   
        	<input type="text" value="{{name}}">    
        	<div>{{name}}</div>    
        </body>   
        </html>  
  
说明：  
 
         目前是第一个版本，主体功能已经稳定，其他功能逐步完善，可以尝开发；如想试玩可直接拷贝test.html
         项目初期文档简陋但已够用，欢迎提交bug，和提出改进意见。我相信sense会成为前端手中的倚天剑。

日志：

    1.2.0：添加新的指令解析方式，由于 table > tbody > tr > td 无法写文本，导致他们之间的 @each 指令没法正确解析 
    修正为
           <!@each( 变量：数组||对象 ,{> 
                你的业务逻辑
           <!})>
    没有内联关系的标签   
           @each( 变量：数组||对象 ,{    
              你的业务逻辑   
           })   
           和  
           <!@each( 变量：数组||对象 ,{>   
                你的业务逻辑  
           <!})>    
    两者都适用




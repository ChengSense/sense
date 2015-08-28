# sense web mvvm framework

版本：1.0.0   

特点：   

    小而美  
    
功能：  

    1.支持小粒度的表达式控制  
    
    2.基于浏览器的模板引擎  
    
    3.循环嵌套  
    
    4.逻辑判断  
    
    5.数据双向绑定
    
指令：

     循环 @each( 变量：数组||对象 ,{  
     
              你的业务逻辑  
              
          })   
          
          或者   
          
          <div each="item1:list1">   
          
             {{name + item1}}  
             
          </li>   
          
     条件 @when( 布尔表达式， {   
     
              你的业务逻辑   
              
          })    
实例：  
  js   ：   
  
        ready(function() {  
        
        	define(function() {   
        	
        		this.id = "3516";   
        		
        		this.name = "chengdong";   
        		
        		this.age = 27;   
        		
        		this.list1 = [ 1, 2 ];   
        		
        		this.list2 = [ 4, 5 ];  
        		
        		this.list3 = [ 4, 5 ];  
        		
        	});   
        	
        })   
        
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
        	
说明：  
 
         目前是第一个版本，主体功能已经稳定，其他功能逐步完善，可以尝试企业级开发如想试玩，可直接拷贝，test.html项目初期文档
         简陋但已够用，欢迎提交bug，和提出改进意见。我相信sense会成为前端手中的倚天剑。




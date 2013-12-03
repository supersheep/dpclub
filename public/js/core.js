var app = (function(){

    var App = window.App = function(){
        this._override_getter_setter("router",{},_route_santitizer);
        this._override_getter_setter("controller",{});
    };

    /**
     * convert object to array with format {key,value}
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    function toArray(obj){
        var arr = [];
        for(var k in obj){
            arr.push({
                key:k,
                value:obj[k]
            });
        }
        return arr;
    }

    /**
     * map object value with mapfunc
     * @param  {[type]} obj     [description]
     * @param  {[type]} mapFunc [description]
     * @return {[type]}         [description]
     */
    function objectMap(obj,mapFunc){
        var ret = {};
        for(var key in obj){
            ret[key] = mapFunc(obj[key],key);
        }
        return ret;
    }
    
    /**
     * parse params from router.origin
     * @param  {[type]} router [description]
     * @param  {[type]} match  [description]
     * @return {[type]}        [description]
     */
    function fillParams(router,match){
        var params = {};
        var m = null;
        var match_index = 1;

        var str = router.origin;
        var reg = /\:([\w\d]+)/g;
        while(m = reg.exec(str)){
            params[m[1]] = match[match_index];
            match_index++;
        }

        return params;
    }   

    function promiseList(){
        var deferred = $.Deferred();
        var promises = Array.prototype.slice.apply(arguments);
        var steps = promises.length;
        var ret = [];
        if(!steps){
            deferred.resolve();
        }
        promises.forEach(function(promise){
            promise.then(function(data){
                ret.push(data);
                steps--;
                if(!steps){
                    deferred.resolve(ret);
                }
            });
        });
        return deferred.promise();
    }

    function promiseMap(data){
        var deferred = $.Deferred();
        var promises = Array.prototype.slice.apply(arguments);

        var steps = Object.keys(data).length;
        var ret = {};

        function successCallBackFactory(item){
            return function(data){
                ret[item] = data;
                steps--;
                if(!steps){
                    deferred.resolve(ret);
                }
            }
        }

        for(var item in data){
            data[item].then(successCallBackFactory(item));
        }

        return deferred.promise();
    }

    /**
     * wrap get data as a promise
     * @return {[type]} [description]
     */
    function dataPromiseWrapper(data){
        var deferred = $.Deferred();
        if(!data){
            deferred.resolve();
        }else{
            $.getJSON(data,function(data){
                deferred.resolve(data);
            });
        }
        return deferred.promise();
    }

    /**
     * wrap get template as a promise
     * @return {[type]} [description]
     */
    function templatePromiseWrapper(template){
        var deferred = $.Deferred();
        if(!template){
            deferred.resolve(template);
        }else{
            $.get(template,function(tpl){
                deferred.resolve(tpl);
            });
        }
        return deferred.promise();
    }

    /**
     * str: a/:id params:{id:1} -> a/1
     * @param  {[type]} str    [description]
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    function resolveParams(value,params){
        var resolved = value;
        if(typeof value == "string"){
            for(var key in params){
                value = value.replace(new RegExp("\\:" + key),params[key]);
            }   
        }else{
            for(var item in value){
                value[item] = resolveParams(value[item],params);
            }
        }
        return value;
    }

    /**
     * [resolveFactory description]
     * @param  {[type]} deps [description]
     * @return {[type]}      [description]
     */
    function resolveFactory(define){
        return function(params){
            // passing router around is sucks, so lets parse them all here
            var def = resolveParams({
                data:define.data,
                template:define.template
            },params);

            var deferred = $.Deferred();

            return promiseMap({
                data: (typeof def.data == "object") 
                    ? promiseMap(objectMap(def.data, dataPromiseWrapper))
                    : dataPromiseWrapper(def.data),
                template:templatePromiseWrapper(def.template)
            });
        }
    }

    /**
     * parse a router to a regular expression
     * @param  {[type]} router [description]
     * @return {[type]} regexp [description]
     */
    function _router_parser(router){
        // "/club/:id" -> /\/club\/([\w\d]+)/
        var regexp_str = "^" + router.replace(/\//g,"\\/").replace(/\:[\d\w]+/g,"([\\w\\d]+)").replace("\?","\\?") + "$";
        var regexp = new RegExp(regexp_str);
        return regexp;
    }

    function _route_santitizer(k,v){
        var router = {
            origin:k,
            regexp:_router_parser(k),
            define:v
        };

        v.resolve = resolveFactory(v);
        return router;
    }

    function dispatch(path){
        var app = this;
        var router = app.matchPath(path);
        var router_define;
        if(!router){
            throw "path " + path + " not found";
        }else{
            router_define = router.define;
            if(router_define.resolve){
                router_define.resolve(router.params).then(function(deps){
                    (app.controller(router_define.controller)).call(app,router,deps);
                });
            }else{
                (app.controller(router_define.controller)).call(app,router);
            }
            
        }
    }

    function matchPath(path){
        var app = this;
        var routers = toArray(app._routers);
        var match = null;
        for(var i=0,router;router=routers[i];i++){
            match = path.match(routers[i].value.regexp);
            if(match){break;}
        }

        if(match){
            router = routers[i].value;
            router.params = fillParams(router,match);
            return router;
        }else{
            return null;
        }

    }

    function _override_getter_setter(name,storage,santitizer){
        var host = this;
        var storage = host["_"+name+"s"] = storage || {};
        santitizer = santitizer || function(k,v){return v;}

        function setter(){
            var args = arguments;
            if(typeof args[0] === "object"){
                for(var k in args[0]){
                    setter(k,args[0][k]);
                }
            }else{
                storage[args[0]] = santitizer(args[0],args[1]);
            }
        }

        function getter(){
            var args = arguments;
            if(args.length === 0){
                return storage;
            }else{
                return storage[args[0]];
            }
        }


        App.prototype[name] = function(){
            var args = arguments;
            if(args.length === 0 || (args.length === 1 && typeof args[0] == "string")){
                return getter.apply(null,args);                
            }else{
                return setter.apply(null,args);
            }
        }
    }

    App.prototype._override_getter_setter = _override_getter_setter;

    App.prototype.dispatch = dispatch;

    App.prototype.matchPath = matchPath;

    App.prototype.locate = function(url){
        History.pushState(null, null, url);
    }

    App.prototype.init = function init(){
        var self = this;

        $(document).delegate("a","click",function(){
            self.locate($(this).attr("href"));
            return false;
        });
        // Bind to StateChange Event
        History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
            var State = History.getState(); // Note: We are using History.getState() instead of event.state
            var hash = State.hash;
            self.dispatch(hash);
        });

        self.dispatch(location.pathname + location.search);
    }

    
    return function(){
        return new App();
    };
})();



/* date formatter */
Date.prototype.format =function(format){
    var o = {
    "M+" : this.getMonth()+1, //month
    "d+" : this.getDate(), //day
    "h+" : this.getHours(), //hour
    "m+" : this.getMinutes(), //minute
    "s+" : this.getSeconds(), //second
    "q+" : Math.floor((this.getMonth()+3)/3), //quarter
    "S" : this.getMilliseconds() //millisecond
    }
    if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
    (this.getFullYear()+"").substr(4- RegExp.$1.length));
    for(var k in o)if(new RegExp("("+ k +")").test(format))
    format = format.replace(RegExp.$1,
    RegExp.$1.length==1? o[k] :
    ("00"+ o[k]).substr((""+ o[k]).length));
    return format;
}


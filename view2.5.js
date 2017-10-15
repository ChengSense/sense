(function () {
    var $express = /\{\s*\{([^\{\}]*)\}\s*\}/g;
    var $each = /(@each)\s*\((.*)\s*,\s*\{/g;
    var $when = /(@when)\s*\((.*)\s*,\s*\{/g;
    var $else = /(@else)/g;
    var $chen = /(@each|@when)\s*\((.*)\s*,\s*\{/g;
    var $lang = /((@each|@when)\s*\((.*)\s*,\s*\{|\{\s*\{([^\{\}]*)\}\s*\}|\s*\}\s*\)|@else)/g;
    var $close = /\}\s*\)\s*/g;
    var $break = /\}\s*\)|(@else)/g;
    var $word = /\w+/g;
    function view(app) {
        this.cache = {};
        var cache = this.cache, $path;
        var resolver = {
            init: function (apply, scope) {
                try {
                    var doc = document.createDocumentFragment();
                    if (apply.clasNode) {
                        var node = insertion([apply]);
                        compiler(doc, scope, [apply], { childNodes: [], childNode: [] });
                        node.parentNode.insertBefore(doc, node);
                    } else {
                        apply = query(apply);
                        app.view = apply[0];
                        var node = blankOut(initCompiler(init(nodeList(apply))))[0];
                        compiler(doc, scope, nodeList(node.children), { childNodes: [], childNode: [] });
                        app.view.clear(doc);
                        app.ctrl();
                        return app.view;
                    }
                } catch (e) {
                    console.log(e);
                }
            },
            express: function (node, scope) {
                try {
                    each(node.scope, function (child, key) {
                        if (!scope[key])
                            scope[key] = child
                    });
                    node.node.nodeValue = code(node.clasNode.nodeValue, scope);
                    if (node.node.name == "value")
                        node.node.ownerElement.value = node.node.nodeValue;
                } catch (e) {
                    console.log(e);
                }
            },
            attribute: function (node, scope) {
                try {
                    each(node.scope, function (child, key) {
                        if (!scope[key])
                            scope[key] = child
                    });
                    var newNode = document.createAttribute(code(node.clasNode.name, scope));
                    newNode.nodeValue = node.clasNode.nodeValue;
                    node.node.ownerElement.setAttributeNode(newNode);
                    node.node.ownerElement.removeAttributeNode(node.node);
                    setComCache(newNode, scope, node.clasNode);
                } catch (e) {
                    console.log(e);
                }
            },
            each: function (node, scope) {
                try {
                    var vie = new view({ view: node, modle: scope });
                    clearEachNode([node]);
                    each(vie.cache, function (nodes, key) {
                        cache[key] = (cache[key] || []).add(nodes);
                    });
                    console.log(cache);
                } catch (e) {
                    console.log(e);
                }
            },
            when: function (node, scope) {
                try {
                    var vie = new view({ view: node, modle: scope });
                    clearWhenNode([node]);
                    each(vie.cache, function (nodes, key) {
                        cache[key] = (cache[key] || []).add(nodes);
                        nodes.forEach(function (child) {
                            if (child.clasNode && child.clasNode.isSameNode(node.clasNode))
                                node.content.childNodes.remove(node).push(child);
                        });
                    });
                    console.log(cache);
                } catch (e) {
                    console.log(e);
                }
            }
        };
        function clearEachNode(nodes) {
            each(nodes, function (node) {
                each(cache, function (children) {
                    each(children, function (child) {
                        if (node.clasNode && !child.clasNode.ownerElement)
                            if (child.clasNode.isSameNode(node.clasNode))
                                children.remove(child), clearChenNode([child]);
                    });
                });
                if (node.childNodes)
                    clearEachNode(node.childNodes);
            });
            return nodes;
        }
        function clearWhenNode(nodes) {
            each(nodes, function (node) {
                clearChenNode([node]);
                each(cache, function (children) {
                    children.remove(node);
                    each(children, function (child) {
                        if (node.node && child.node && !child.node.ownerElement)
                            if (child.node.isSameNode(node.node))
                                children.remove(child);
                    });
                });
                if (node.childNodes)
                    clearWhenNode(node.childNodes);
            });
            return nodes;
        }
        function clearChenNode(nodes) {
            each(nodes, function (child) {
                if (child.node && child.node.parentNode)
                    return child.node.parentNode.removeChild(child.node);
                if (child.childNodes)
                    clearChenNode(child.childNodes);
            });
        }
        function insertion(nodes, iNode) {
            iNode = iNode || {};
            each(nodes, function (child) {
                if (child.parentNode || child.ownerElement)
                    return iNode["0"] = child.ownerElement || child;
                if (child.node && (child.node.parentNode || child.node.ownerElement))
                    return iNode["0"] = child.node.ownerElement || child.node;
                insertion(child.childNodes, iNode);
            });
            return iNode["0"];
        }
        function code(_express, _scope) {
            try {
                with (_scope) {
                    _express = _express.replace($express, "$1").replace(/[\f\n\r\v]/g, "")
                    return codei(_express, _scope);
                }
            } catch (err) {
                console.log(err)
            }
        }
        function buildPath(_express) {
            try {
                _express = _express.replace("$path:", "").replace(/(\w+)\.?/g, "['$1']").replace(/\['(\w+)'\]/, "$1")
                return _express;
            } catch (err) {
                console.log(err)
            }
        }
        function codei(_express, _scope) {
            try {
                with (_scope) {
                    _express = _express.replace($word, function (express) {
                        try {
                            var variable = eval(express);
                            if (typeof (variable) == 'string' && /^\$path:/g.test(variable))
                                return buildPath(variable);
                        } catch (e) {
                            return express;
                        }
                        return express;
                    });
                    return eval(_express);
                }
            } catch (e) {
                console.log(e)
            }
        }
        function nodeList(nodes) {
            return each(nodes, [], function (node, i, list) {
                list.push(this);
            });
        }
        function classNode(newNode, child) {
            return {
                node: newNode,
                clasNode: child.node,
                children: child.children,
                scope: child.scope,
                childNodes: []
            };
        }
        function init(dom) {
            each(dom, function (node) {
                if (node.childNodes[0] && node.nodeName != "SCRIPT")
                    init(nodeList(node.childNodes));
                if (node.nodeType == 3)
                    node.nodeValue.replace($lang, function (tag) {
                        var nodes = node.nodeValue.split(tag);
                        node.parentNode.insertBefore(document.createTextNode(nodes[0]), node);
                        node.parentNode.insertBefore(document.createTextNode(tag), node);
                        node.nodeValue = node.nodeValue.replace(nodes[0], "").replace(tag, "");
                    });
            });
            return dom;
        }
        function blankOut(dom) {
            each(dom, function (child) {
                if (child.children[0] && child.node.nodeName != "SCRIPT")
                    blankOut(child.children);
                if (child.node.nodeValue && child.node.nodeValue.trim() == "" || child.node.nodeValue == "")
                    dom.remove(child);
            });
            return dom;
        }
        function setCache(node, scope, clasNode, content) {
            if (!clasNode.clasNode) return;
            switch (clasNode.clasNode.nodeType) {
                case 1:
                    var key = clasNode.clasNode.getAttribute("each").split(":").pop();
                    if (scope[key] == undefined || !codei(key, scope)) return;
                    cache[$path] = cache[$path] || [];
                    clasNode.resolver = "each";
                    clasNode.content = content;
                    clasNode.scope = scope;
                    clasNode.node = node;
                    cache[$path].push(clasNode);
                    return;
                default:
                    (clasNode.clasNode.nodeValue || "").replace($each, function (key) {
                        key = key.replace($each, "$2").split(":").pop();
                        if (scope[key] == undefined || !codei(key, scope)) return;
                        cache[$path] = cache[$path] || [];
                        clasNode.resolver = "each";
                        clasNode.content = content;
                        clasNode.scope = scope;
                        clasNode.node = node;
                        cache[$path].push(clasNode);
                    });
                    (clasNode.clasNode.nodeValue || "").replace($when, function (key) {
                        key = key.replace($when, "$2");
                        key.replace($word, function (key) {
                            if (scope[key] == undefined || !codei(key, scope)) return;
                            cache[$path] = cache[$path] || [];
                            clasNode.resolver = "when";
                            clasNode.content = content;
                            clasNode.scope = scope;
                            clasNode.node = node;
                            cache[$path].push(clasNode);
                        });
                    });
                    break;
            }
        }
        function setComCache(node, scope, clasNode) {
            if (node.name == "value")
                binding(node, scope);
            (clasNode.name || "").replace($express, function (key) {
                key = key.replace($express, "$1");
                if (scope[key] == undefined || !codei(key, scope)) return;
                cache[$path] = cache[$path] || [];
                cache[$path].push({
                    resolver: "attribute",
                    clasNode: clasNode,
                    scope: scope,
                    node: node
                });
            });
            (node.nodeValue || "").replace($express, function (key) {
                key = key.replace($express, "$1");
                key.replace($word, function (key) {
                    if (scope[key] == undefined || codei(key, scope) == undefined) return;
                    cache[$path] = cache[$path] || [];
                    cache[$path].push({
                        resolver: "express",
                        clasNode: clasNode,
                        scope: scope,
                        node: node
                    });
                });
            });
        }
        function initCompiler(node, children) {
            return each(node, children || [], function (child, i, list) {
                node.shift();
                if (child.nodeValue && child.nodeValue.match($close))
                    return true;
                var item = { node: child, children: [] };
                list.push(item);
                switch (child.nodeType) {
                    case 1:
                        initCompiler(nodeList(child.childNodes), item.children);
                        break;
                    default:
                        child.nodeValue.replace($chen, function () {
                            initCompiler(node, item.children);
                        });
                        break;
                };
            });
        }
        function commom(node, scope, clasNode) {
            each(node.attributes, function (child) {
                child.name.replace($express, function (tag) {
                    try {
                        var node = document.createAttribute(code(child.name, scope));
                        node.nodeValue = child.nodeValue;
                        child.ownerElement.setAttributeNode(node);
                        child.ownerElement.removeAttributeNode(child);
                        setComCache(node, scope, clasNode.getAttributeNode(child.name));
                        commom(node, scope, clasNode.getAttributeNode(child.name));
                    } catch (e) {
                        console.log(child.name + "属性节点不允许为null或者''， " + child.name + "=" + child.nodeValue + "属性节点创建失败");
                    }
                });
                commom(child, scope, clasNode.getAttributeNode(child.name));
            });
            if (node.nodeValue)
                node.nodeValue.replace($express, function () {
                    setComCache(node, scope, clasNode);
                    node.nodeValue = code(node.nodeValue, scope);
                });
        }
        function setting(child, scope) {
            each(child.scope, function (child, key) {
                if (!scope[key])
                    scope[key] = child
            });
            if (!child.clasNode)
                return child;
            return {
                node: (child.clasNode || child.node),
                scope: scope,
                clasNode: child.clasNode,
                children: child.children,
                childNodes: []
            };
        }
        function compiler(node, iscope, childNodes, content) {
            each(childNodes, function (child, index, childNodes) {
                child = setting(child, iscope);
                if (child.node.nodeValue && child.node.nodeValue.match($break))
                    return childNodes.clear();
                switch (child.node.nodeType) {
                    case 1:
                        if (child.node.hasAttribute("each")) {
                            var expreses = child.node.getAttribute("each").split(":");
                            child.node.variable = expreses.shift().trim(), child.node.dataSource = expreses.pop().trim();
                            each(codei(child.node.dataSource, iscope), function (item, index) {
                                var scope = Object.create(iscope || {})
                                scope[child.node.variable] = "$path:" + $path;
                                if (expreses[0]) scope[expreses[0].trim()] = index;
                                var newNode = child.node.cloneNode();
                                newNode.removeAttribute("each");
                                node.appendChild(newNode);
                                var clasNode = classNode(newNode, child);
                                content.childNodes.push(clasNode);
                                setCache(newNode, scope, clasNode, content);
                                compiler(newNode, scope, nodeList(child.children), clasNode);
                                commom(newNode, scope, child.node);
                            });
                        } else {
                            var newNode = child.node.cloneNode();
                            node.appendChild(newNode);
                            var clasNode = classNode(newNode, child);
                            content.childNodes.push(clasNode);
                            compiler(newNode, iscope, nodeList(child.children), clasNode);
                            commom(newNode, iscope, child.node);
                        }
                        break;
                    default:
                        if ($each.test(child.node.nodeValue)) {
                            var expreses = child.node.nodeValue.replace($each, "$2").split(":");
                            child.node.variable = expreses.shift().trim(), child.node.dataSource = expreses.pop().trim();
                            var dataSource = codei(child.node.dataSource, iscope) || [];
                            each(dataSource, nodeList(child.children), function (item, index, children) {
                                var scope = Object.create(iscope || {});
                                scope[child.node.variable] = "$path:" + $path;
                                if (expreses[0]) scope[expreses[0].trim()] = index;
                                var clasNode = classNode(null, child);
                                content.childNodes.push(clasNode);
                                setCache(null, scope, clasNode, content);
                                compiler(node, scope, nodeList(children), clasNode);
                            });
                        } else if ($when.test(child.node.nodeValue)) {
                            var clasNode = classNode(null, child);
                            content.childNodes.push(clasNode);
                            setCache(null, iscope, clasNode, content);
                            var when = codei(child.node.nodeValue.replace($when, "$2"), iscope);
                            if (when) {
                                each(nodeList(child.children), function (child, index, childNodes) {
                                    if (child.node.nodeValue && child.node.nodeValue.match($break))
                                        return true;
                                    switch (child.node.nodeType == 1 || $chen.test(child.node.nodeValue)) {
                                        case true:
                                            compiler(node, iscope, childNodes, clasNode);
                                            break;
                                        default:
                                            var newNode = child.node.cloneNode();
                                            node.appendChild(newNode);
                                            clasNode.childNodes.push(classNode(newNode, child));
                                            commom(newNode, iscope, child.node);
                                            break;
                                    }
                                    childNodes.shift();
                                });
                            } else {
                                each(nodeList(child.children), function (child, index, childNodes) {
                                    childNodes.shift();
                                    if ($else.test(child.node.nodeValue)) {
                                        each(childNodes, function (child, index, childNodes) {
                                            switch ($chen.test(child.node.nodeValue) || child.node.nodeType == 1) {
                                                case true:
                                                    compiler(node, iscope, childNodes, clasNode);
                                                    break;
                                                default:
                                                    var newNode = child.node.cloneNode();
                                                    node.appendChild(newNode);
                                                    clasNode.childNodes.push(classNode(newNode, child));
                                                    commom(newNode, iscope, child.node);
                                                    break;
                                            }
                                            childNodes.shift();
                                        });
                                    }
                                });
                            }
                        } else {
                            var newNode = child.node.cloneNode();
                            node.appendChild(newNode);
                            content.childNodes.push(classNode(newNode, child));
                            commom(newNode, iscope, child.node);
                        }
                        break;
                }
                childNodes.shift();
            });
        }
        function binding(node, scope) {
            var owner = node.ownerElement;
            owner._express = node.nodeValue.replace($express, "$1");
            owner.on("change", function handle() {
                scope[owner._express] = owner.value;
            });
        }
        observe(app.modle, function (name, path) {
            var nodes = each(nodeList(cache[path]), [], function (node, i, list) {
                list.push(node);
                if (node.resolver == "each")
                    return true;
            });
            each(nodes, function (node) {
                resolver[node.resolver](node, app.modle.clone());
            });
        }, function (name, path) {
            $path = path;
        });
        resolver["init"](app.view, app.modle);
        return this;
    }
    window.view = view;
})(window);
(function () {
    function query(express) {
        try {
            var doc = document.querySelectorAll(express);
            if (!doc[0])
                throw new Error();
            return doc;
        } catch (e) {
            var newNode = document.createElement("div");
            newNode.innerHTML = express;
            return newNode.childNodes;
        }
    }
    function ready(func) {
        var done = false;
        var init = function () {
            if (done) {
                document.removeEventListener("DOMContentLoaded", init, false);
                window.removeEventListener("load", init, false);
                func();
                return;
            }
            if (document.readyState == "complete") {
                done = true;
                init();
            }
        };
        document.addEventListener("DOMContentLoaded", init, false);
        window.addEventListener("load", init, false);
        init();
    }
    function setPrototype(object, config) {
        for (var key in config) {
            object.prototype[key] = config[key];
        }
    }
    function each(obj, arg, callback) {
        if (!obj || typeof obj != "object") return arg;
        var methd = arguments[2] || arguments[1];
        var args = arguments[2] ? arg : obj;
        if (Array.isArray(obj)) {
            var length = obj.length;
            for (var i = 0; i < length; i++) {
                if (obj.length != length)
                    i-- , length = obj.length;
                if (obj.hasOwnProperty(i)) {
                    var data = obj[i];
                    if (methd.call(data, data, i, args))
                        break;
                }
            }
        } else {
            for (var i in obj)
                if (obj.hasOwnProperty(i)) {
                    var data = obj[i];
                    if (methd.call(data, data, i, args))
                        break;
                }
        }
        return args;
    }
    ["push", "pop", "reverse", "shift", "unshift", "splice"].forEach(function (name) {
        var method = Array.prototype[name];
        Array.prototype[name] = function () {
            var data = method.apply(this, arguments);
            if (this.watch)
                this.watch();
            return data;
        }
    });
    setPrototype(Object, {
        clone: function (p) {
            p = p || this;
            var c = new p.constructor();
            Object.keys(p).forEach(function (i) {
                if (p == p[i])
                    p[i] = {}
                if (typeof (p[i]) == "object")
                    c[i] = Object.clone(p[i]);
                else
                    c[i] = p[i];
            });
            return c;
        }
    });
    setPrototype(Array, {
        add: function (n) {
            var thiz = this;
            n.forEach(function (entity) {
                thiz.push(entity);
            })
            return this;
        },
        remove: function (n) {
            var index = this.indexOf(n);
            if (index > -1)
                this.splice(index, 1);
            return this;
        },
        removes: function (n) {
            var length = this.length;
            for (var i = 0; i < length; i++) {
                if (this.length != length)
                    (i-- , length = this.length);
                var index = n.indexOf(this[i]);
                if (index < 0)
                    this.splice(i, 1);
            }
        },
        replace: function (o, n) {
            var index = this.indexOf(o);
            if (index > -1)
                this.splice(index, 1, n);
        },
        clear: function (n) {
            this.splice(0, this.length);
            return this;
        }
    });
    setPrototype(Node, {
        on: function (type, call) {
            this["eventManager"] = this["eventManager"] || {};
            if (!this["eventManager"][type]) {
                this["eventManager"][type] = [];
                var node = this;
                this.addEventListener(type, function (e) {
                    each(this["eventManager"][type], function () {
                        this.call(node, arguments);
                    });
                }, false);
            }
            this["eventManager"][type].push(call);
        },
        off: function (type, call) {
            each(this["eventManager"][type], this["eventManager"][type], function (fuc, i, list) {
                if (call != undefined && this != call)
                    return;
                delete list[i];
            });
            if (!this["eventManager"][type][0])
                this.removeEventListener(type, call, false);
        },
        clone: function () {
            switch (this.nodeType) {
                case 1:
                    if (undefined != window.jQuery)
                        return jQuery(this).clone(true)[0];
                default:
                    var node = this.cloneNode(true);
                    each(node["eventManager"] = this["eventManager"], function (list, type) {
                        node.addEventListener(type, function (e) {
                            each(this["eventManager"][type], function () {
                                this();
                            });
                        }, false);
                    });
                    return node;
            }
        },
        clear: function (node) {
            this.innerHTML = "";
            this.appendChild(node);
            return this;
        },
    });
    setPrototype(NodeList, {
        on: function (type, call, bol) {
            each(this, function (node) {
                node.on(type, call, bol);
            });
        },
        off: function (type, call, bol) {
            each(this, function (node) {
                node.off(type, call, bol);
            });
        },
        append: function (node) {
            switch (typeof node) {
                case "string":
                    var newNode = document.createElement("div");
                    newNode.innerHTML = node;
                    each(newNode.childNodes, this[0], function (node, i, thiz) {
                        thiz.appendChild(node);
                    });
                    break;
                default:
                    switch (node.length) {
                        case undefined:
                            this[0].appendChild(node);
                            break;
                        default:
                            each(node, this[0], function (node, i, thiz) {
                                thiz.appendChild(node);
                            });
                            break;
                    }
                    break;
            }
        },
        after: function (node) {
            switch (typeof node) {
                case "string":
                    var newNode = document.createElement("div");
                    newNode.innerHTML = node;
                    each(newNode.childNodes, this[0], function (node, i, thiz) {
                        thiz.parentNode.insertBefore(this, thiz.nextSibling);
                    });
                    break;
                default:
                    switch (node.length) {
                        case undefined:
                            this[0].parentNode.insertBefore(node, this[0].nextSibling);
                            break;
                        default:
                            each(node, this[0], function (node, i, thiz) {
                                thiz.parentNode.insertBefore(node, thiz.nextSibling);
                            });
                            break;
                    }
                    break;
            }
        },
        before: function (node) {
            switch (typeof node) {
                case "string":
                    var newNode = document.createElement("div");
                    newNode.innerHTML = node;
                    each(newNode.childNodes, this[0], function (node, i, thiz) {
                        thiz.parentNode.insertBefore(this, thiz);
                    });
                    break;
                default:
                    switch (node.length) {
                        case undefined:
                            this[0].parentNode.insertBefore(node, this[0]);
                            break;
                        default:
                            each(node, this[0], function (node, i, thiz) {
                                thiz.parentNode.insertBefore(node, thiz);
                            });
                            break;
                    }
                    break;
            }
        },
        replace: function (node) {
            switch (typeof node) {
                case "string":
                    var newNode = document.createElement("div");
                    newNode.innerHTML = node;
                    each(newNode.childNodes, this[0], function (node, i, thiz) {
                        thiz.parentNode.replaceChild(this, thiz);
                    });
                    break;
                default:
                    switch (node.length) {
                        case undefined:
                            this[0].parentNode.replaceChild(node, this[0]);
                            break;
                        default:
                            each(node, this[0], function (node, i, thiz) {
                                thiz.parentNode.replaceChild(node, thiz);
                            });
                            break;
                    }
                    break;
            }
        },
        clone: function (bol) {
            return this[0].cloneNode(bol || true);
        }
    });
    var observe = function (obj, callSet, callGet) {
        var _observe = function (target, callSet, callGet, object, root) {
            if (Array.isArray(target)) {
                if (!target.watch)
                    Object.defineProperty(target, "watch", {
                        get: function () {
                            return function () {
                                with ({ obj: obj, target: target }) {
                                    eval("obj" + root.join(".").replace(/(\w+)\.?/g, "['$1']") + "=target");
                                }
                            };
                        }
                    });
            }
            if (typeof target == "object") {
                Object.keys(target).forEach(function (prop) {
                    if (target.hasOwnProperty(prop)) {
                        if (!Object.getOwnPropertyDescriptor(target, prop).set) {
                            var path = Object.create(root || []);
                            path.push(prop);
                            if (typeof target[prop] == "object")
                                _observe(target[prop], callSet, callGet, object[prop] = {}, path);
                            _watch(target, prop, object, path);
                        }
                    }
                })
            }
            return target;
        };
        var _watch = function (target, prop, object, path) {
            var value = target[prop];
            Object.defineProperty(target, prop, {
                get: function () {
                    if (object[prop])
                        callGet.call(this, prop, path.join("."));
                    return object[prop];
                },
                set: function (value) {
                    var oldValue = target[prop];
                    if (oldValue != value)
                        object[prop] = _observe(value, callSet, callGet, object[prop] = {}, path);
                    if (oldValue != undefined)
                        callSet.call(this, prop, path.join("."));
                }
            });
            target[prop] = value;
        };
        return new _observe(obj, callSet, callGet, {});
    };
    window.observe = observe;
    window.query = query;
    window.each = each;
    window.$ = ready;
})(window);

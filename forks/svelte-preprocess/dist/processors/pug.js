"use strict";var __createBinding=this&&this.__createBinding||(Object.create?function(a,b,c,d){d===void 0&&(d=c),Object.defineProperty(a,d,{enumerable:!0,get:function(){return b[c]}})}:function(a,b,c,d){d===void 0&&(d=c),a[d]=b[c]}),__setModuleDefault=this&&this.__setModuleDefault||(Object.create?function(a,b){Object.defineProperty(a,"default",{enumerable:!0,value:b})}:function(a,b){a["default"]=b}),__importStar=this&&this.__importStar||function(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)"default"!=c&&Object.hasOwnProperty.call(a,c)&&__createBinding(b,a,c);return __setModuleDefault(b,a),b},__importDefault=this&&this.__importDefault||function(a){return a&&a.__esModule?a:{default:a}};Object.defineProperty(exports,"__esModule",{value:!0});const strip_indent_1=__importDefault(require("strip-indent"));exports.default=a=>({async markup({content:b,filename:c}){const{default:d}=await Promise.resolve().then(()=>__importStar(require("../transformers/pug")));return b=strip_indent_1.default(b),d({content:b,filename:c,options:a})}});
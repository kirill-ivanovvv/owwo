"use strict";var __importDefault=this&&this.__importDefault||function(a){return a&&a.__esModule?a:{default:a}};Object.defineProperty(exports,"__esModule",{value:!0});const less_1=__importDefault(require("less")),getIncludePaths_1=require("../modules/getIncludePaths"),transformer=async({content:a,filename:b,options:c={}})=>{c={paths:getIncludePaths_1.getIncludePaths(b,c.paths),...c};const{css:d,map:e,imports:f}=await less_1.default.render(a,{sourceMap:{},filename:b,...c});return{code:d,map:e,dependencies:f}};exports.default=transformer;
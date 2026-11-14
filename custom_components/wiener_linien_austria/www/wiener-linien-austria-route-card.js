/*! Wiener Linien Austria — bundled by Rolldown. Edit sources in src/, then `npm run build`. */
/**
* @license
* Copyright 2019 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=/* @__PURE__ */ new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:f,getOwnPropertySymbols:p,getPrototypeOf:ee}=Object,m=globalThis,te=m.trustedTypes,ne=te?te.emptyScript:``,re=m.reactiveElementPolyfillSupport,h=(e,t)=>e,g={toAttribute(e,t){
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
switch(t){case Boolean:e=e?ne:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},ie=(e,t)=>!l(e,t),ae={attribute:!0,type:String,converter:g,reflect:!1,useDefault:!1,hasChanged:ie};Symbol.metadata??=Symbol(`metadata`),m.litPropertyMetadata??=/* @__PURE__ */ new WeakMap;var _=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ae){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ae}static _$Ei(){if(this.hasOwnProperty(h(`elementProperties`)))return;let e=ee(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(h(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(h(`properties`))){let e=this.properties,t=[...f(e),...p(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=/* @__PURE__ */ new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=/* @__PURE__ */ new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=/* @__PURE__ */ new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=/* @__PURE__ */ new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?g:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?g:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??ie)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=/* @__PURE__ */ new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=/* @__PURE__ */ new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=/* @__PURE__ */ new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};_.elementStyles=[],_.shadowRootOptions={mode:`open`},_[h(`elementProperties`)]=/* @__PURE__ */ new Map,_[h(`finalized`)]=/* @__PURE__ */ new Map,re?.({ReactiveElement:_}),(m.reactiveElementVersions??=[]).push(`2.1.2`);
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
var v=globalThis,oe=e=>e,y=v.trustedTypes,se=y?y.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,ce=`$lit$`,b=`lit$${Math.random().toFixed(9).slice(2)}$`,le=`?`+b,ue=`<${le}>`,x=document,S=()=>x.createComment(``),C=e=>e===null||typeof e!=`object`&&typeof e!=`function`,de=Array.isArray,fe=e=>de(e)||typeof e?.[Symbol.iterator]==`function`,w=`[ 	
\f\r]`,T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,pe=/-->/g,me=/>/g,E=RegExp(`>|${w}(?:([^\\s"'>=/]+)(${w}*=${w}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),he=/'/g,ge=/"/g,_e=/^(?:script|style|textarea|title)$/i,D=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),O=Symbol.for(`lit-noChange`),k=Symbol.for(`lit-nothing`),ve=/* @__PURE__ */ new WeakMap,A=x.createTreeWalker(x,129);function ye(e,t){if(!de(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return se===void 0?t:se.createHTML(t)}var be=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=T;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===T?c[1]===`!--`?o=pe:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=E):(_e.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=E):o=me:o===E?c[0]===`>`?(o=i??T,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?E:c[3]===`"`?ge:he):o===ge||o===he?o=E:o===pe||o===me?o=T:(o=E,i=void 0);let d=o===E&&e[t+1].startsWith(`/>`)?` `:``;a+=o===T?n+ue:l>=0?(r.push(s),n.slice(0,l)+ce+n.slice(l)+b+d):n+b+(l===-2?t:d)}return[ye(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},xe=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=be(t,n);if(this.el=e.createElement(l,r),A.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=A.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(ce)){let t=u[o++],n=i.getAttribute(e).split(b),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?Ce:r[1]===`?`?we:r[1]===`@`?Te:N}),i.removeAttribute(e)}else e.startsWith(b)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(_e.test(i.tagName)){let e=i.textContent.split(b),t=e.length-1;if(t>0){i.textContent=y?y.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],S()),A.nextNode(),c.push({type:2,index:++a});i.append(e[t],S())}}}else if(i.nodeType===8){if(i.data===le)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(b,e+1))!==-1;)c.push({type:7,index:a}),e+=b.length-1}}a++}}static createElement(e,t){let n=x.createElement(`template`);return n.innerHTML=e,n}};function j(e,t,n=e,r){if(t===O)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=C(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=j(e,i._$AS(e,t.values),i,r)),t}var Se=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??x).importNode(t,!0);A.currentNode=r;let i=A.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new M(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Ee(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=A.nextNode(),a++)}return A.currentNode=x,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},M=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=k,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=j(this,e,t),C(e)?e===k||e==null||e===``?(this._$AH!==k&&this._$AR(),this._$AH=k):e!==this._$AH&&e!==O&&this._(e):e._$litType$===void 0?e.nodeType===void 0?fe(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==k&&C(this._$AH)?this._$AA.nextSibling.data=e:this.T(x.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=xe.createElement(ye(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new Se(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=ve.get(e.strings);return t===void 0&&ve.set(e.strings,t=new xe(e)),t}k(t){de(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(S()),this.O(S()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=oe(e).nextSibling;oe(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},N=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=k,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(/* @__PURE__ */ new String),this.strings=n):this._$AH=k}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=j(this,e,t,0),a=!C(e)||e!==this._$AH&&e!==O,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=j(this,r[n+o],t,o),s===O&&(s=this._$AH[o]),a||=!C(s)||s!==this._$AH[o],s===k?e=k:e!==k&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===k?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},Ce=class extends N{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===k?void 0:e}},we=class extends N{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==k)}},Te=class extends N{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=j(this,e,t,0)??k)===O)return;let n=this._$AH,r=e===k&&n!==k||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==k&&(n===k||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ee=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){j(this,e)}},De=v.litHtmlPolyfillSupport;De?.(xe,M),(v.litHtmlVersions??=[]).push(`3.3.3`);var Oe=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new M(t.insertBefore(S(),e),e,void 0,n??{})}return i._$AI(e),i},ke=globalThis,P=class extends _{constructor(){
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Oe(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return O}};P._$litElement$=!0,P.finalized=!0,ke.litElementHydrateSupport?.({LitElement:P});var Ae=ke.litElementPolyfillSupport;Ae?.({LitElement:P}),(ke.litElementVersions??=[]).push(`4.2.2`);
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
var je=e=>(t,n)=>{n===void 0?customElements.define(e,t):n.addInitializer(()=>{customElements.define(e,t)})},Me={attribute:!0,type:String,converter:g,reflect:!1,hasChanged:ie},Ne=(e=Me,t,n)=>{
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=/* @__PURE__ */ new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function F(e){return(t,n)=>typeof n==`object`?Ne(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/function I(e){return F({...e,state:!0,attribute:!1})}
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
var Pe={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Fe=e=>(...t)=>({_$litDirective$:e,values:t}),Ie=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},Le=`important`,Re=` !`+Le,ze=Fe(class extends Ie{constructor(e){
/**
* @license
* Copyright 2018 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
if(super(e),e.type!==Pe.ATTRIBUTE||e.name!==`style`||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{let r=e[n];return r==null?t:t+`${n=n.includes(`-`)?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,`-$&`).toLowerCase()}:${r};`},``)}update(e,[t]){let{style:n}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let e of this.ft)t[e]??(this.ft.delete(e),e.includes(`-`)?n.removeProperty(e):n[e]=null);for(let e in t){let r=t[e];if(r!=null){this.ft.add(e);let t=typeof r==`string`&&r.endsWith(Re);e.includes(`-`)||t?n.setProperty(e,t?r.slice(0,-11):r,t?Le:``):n[e]=r}}return O}}),Be=`2.4.0`,Ve=`#1b1464`,He=`#fef200`;function Ue(e){return typeof e==`string`&&/^https?:\/\//i.test(e)?e:``}function We(e,t,n){e.dispatchEvent(new CustomEvent(t,{detail:n,bubbles:!0,composed:!0}))}function Ge(e,t,n){if(e!==`grid`)return!1;let r=t&&`grid_options`in t?t.grid_options:void 0;return typeof((r&&typeof r==`object`&&`rows`in r?r.rows:void 0)??n)==`number`}function Ke(e,t,n){if(!e.has(`hass`)||e.size>1)return!0;let r=e.get(`hass`);return!r||!t||r.language!==t.language||n().some(e=>r.states[e]!==t.states[e])}var qe=`
@font-face {
  font-family: "WL Sans";
  src: url("/wiener-linien-austria/fonts/wl-sans-regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "WL Sans";
  src: url("/wiener-linien-austria/fonts/wl-sans-bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "WL Sans Condensed";
  src: url("/wiener-linien-austria/fonts/wl-sans-condensed-bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "WL Mono";
  src: url("/wiener-linien-austria/fonts/wl-mono-regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "WL Mono";
  src: url("/wiener-linien-austria/fonts/wl-mono-bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
`,Je=`wl-austria-fonts`;function Ye(){if(typeof document>`u`||document.getElementById(Je))return;let e=document.createElement(`style`);e.id=Je,e.textContent=qe,document.head.appendChild(e)}var Xe={de:{common:{picker:{picker_modern:`Abfahrten mit Störungen und Aufzugsinfos`,picker_retro:`LED-Anzeige wie in den Wiener-Linien-Stationen`,picker_flap:`Abfahrten als Fallblattanzeige`,picker_route:`Nächste Verbindung von A nach B, mit Puffer beim Umsteigen`},editor:{add_chip:`Chip hinzufügen`,add_icon:`Symbol hinzufügen`,date_format_placeholder:`d.m.Y`,direction_label:`Fahrtrichtung`,direction_not_served:`nicht bedient`,direction_note_one_way:`Rückfahrt deaktiviert: {line} endet hier.`,direction_unavailable:`Keine Abfahrten in dieser Richtung`,entities:`Haltestellen`,entity:`Haltestelle`,header_amenities:`Symbole in diesem Slot`,header_bar_aria:`Stationsanzeige — Seite wählen`,header_chips_and_icons:`Textchips (max. {chips}) und Extra-Symbole (max. {icons})`,header_left:`Linke Seite`,header_pick_side_hint:`Seite antippen, dann unten füllen`,header_right:`Rechte Seite`,header_side_aria:`Seite der Stationsanzeige`,header_slot_empty:`leer`,line_active_aria:`Linie {line} aktiv`,line_inactive_aria:`Linie {line} inaktiv`,lines_empty_means_all:`leer = alle Linien`,lines_label:`Linien an dieser Haltestelle`,lines_selected:`{n} von {total}`,no_lines_hint:`Die Linien erscheinen, sobald diese Haltestelle Abfahrten meldet.`,no_lines_title:`Noch keine Linien verfügbar`,per_line_direction_aria:`Linie {line}: {direction}`,remove_chip_aria:`Chip {chip} entfernen`,remove_icon_aria:`Symbol {icon} entfernen`,remove_stop:`Haltestelle entfernen`,section_board:`Fallblatt-Tafel`,section_departure_row:`Abfahrtszeile`,section_extras:`Extras`,section_extras_hint:`optional`,section_footer:`Fußzeile`,section_header:`Stationsanzeige`,section_header_hint:`Direkt am Balken`,section_led_panel:`LED-Anzeige`,section_station:`Stationsband`,section_walk_time:`Gehzeit zur Haltestelle`,show_clock_short:`Uhr`,show_date_short:`Datum`,show_elevator_short:`Lift`,show_escalator_short:`Rolltreppe`,show_wc_short:`WC`,size_medium:`Mittel`,size_regular:`Standard`,size_small:`Klein`,tab_display:`Anzeige`,tab_stop:`Haltestelle`,tab_stops:`Haltestellen`,tab_tweaks:`Stil`,text_placeholder:`z. B. Name der nächsten Station`,walk_time_aria:`Gehzeit in Minuten für Linie {line} Richtung {towards}`,walk_time_branching_hint:`Gilt für alle Endstationen in dieser Richtung`,walk_time_hint:`Blendet Abfahrten aus, die ohne dich abfahren würden. Leer = kein Filter.`,walk_time_less_aria:`Gehzeit für Linie {line} verringern`,walk_time_more_aria:`Gehzeit für Linie {line} erhöhen`,walk_time_placeholder:`–`,walk_time_unit:`Minuten`}},modern:{no_data:`Keine Abfahrten verfügbar`,betriebsschluss:`Betriebsschluss`,unavailable:`Keine Verbindung zu den Wiener Linien`,unavailable_detail:`Du musst nichts tun. Die Abfahrten erscheinen wieder, sobald die Wiener Linien antworten.`,stale_feed:`Keine aktuellen Daten`,stale_feed_detail:`Die Wiener Linien melden für diese Haltestelle veraltete Abfahrtszeiten. Sobald wieder Echtzeitdaten kommen, füllt sich die Anzeige automatisch.`,stale_feed_since:`Letzte gemeldete Abfahrt: {time}`,stale_feed_partial:`Einzelne Linien melden keine aktuellen Zeiten.`,connection_lost_partial:`Keine Verbindung zu den Wiener Linien seit {time}. Die Zeiten unten sind nicht aktuell.`,min:`Min`,now:`Jetzt`,platform_short_rail:`Gleis`,platform_short_bus:`Steig`,version_update:`Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.`,entity_missing:`Sensor {entity} existiert nicht mehr. Wähle einen anderen Sensor oder entferne ihn aus den Haltestellen dieser Karte.`,no_entities_picked:`Keine Haltestelle ausgewählt`,no_entities_available:`Keine Wiener-Linien-Sensoren gefunden`,departures_list:`Kommende Abfahrten`,barrier_free_title:`Barrierefrei zugänglich`,cooling_title:`Klimatisiert`,disturbance_title:`Verkehrsbehinderung gemeldet`,stops_ahead_aria_show:`Streckenverlauf für {line} Richtung {towards} anzeigen`,stops_ahead_aria_hide:`Streckenverlauf für {line} Richtung {towards} ausblenden`,stops_ahead_other_show:`{count} weitere Linien bei {stop} anzeigen`,stops_ahead_other_hide:`Weitere Linien bei {stop} ausblenden`,departure_time_title:`Voraussichtliche Abfahrt`,stop_time_title:`Voraussichtliche Ankunft`,stop_time_late:`geplant {time}, {n} min später`,stop_skipped:`Kein Halt`,stop_skipped_until:`Kein Halt bis {date}`,stop_skipped_until_time:`Kein Halt bis {time} Uhr`,dir_h:`Hinfahrt`,dir_r:`Rückfahrt`,dir_h_short:`H`,dir_r_short:`R`,dir_both:`Beide`,traffic_label:`Störung`,traffic_until:`Bis`,traffic_updated:`aktualisiert`,elevator_until:`Bis`,open_in_maps:`In Karte öffnen`,qr_open:`QR-Code anzeigen`,qr_dialog_title:`QR-Code für Haltestelle`,qr_dialog_hint:`Mit dem Smartphone scannen — öffnet die Haltestelle in der Karten-App.`,qr_dialog_close:`QR-Code schließen`,delay_singular:`1 Min. verspätet`,delay_plural:`{n} Min. verspätet`,devmode_title:`DEV`,devmode_traffic_btn:`Störung testen`,devmode_elevator_btn:`Aufzug testen`,devmode_colors_btn:`Linienfarben`,devmode_clear_btn:`Löschen`,editor:{accessibility_only:`Nur barrierefreie Abfahrten anzeigen`,accessibility_only_requires:`Braucht „Barrierefrei-Symbol anzeigen“.`,colors_empty_hint:`Wähle im ersten Reiter Haltestellen aus — ihre Linien erscheinen dann hier.`,colors_hint:`Optional. Ohne Überschreibung gilt die offizielle Linienfarbe.`,hide_attribution:`Datenquelle ausblenden`,hide_attribution_helper:`Wenn aktiv, wird die CC-BY-Quellenangabe am unteren Rand der Karte ausgeblendet. Die OGD-Lizenz der Wiener Linien verlangt eine sichtbare Quellenangabe, sofern der Hinweis nicht an anderer Stelle im Dashboard erscheint.`,hide_header:`Kopfzeile ausblenden`,hide_header_helper:`Blendet die Zeile mit Haltestellenname, Karten- und QR-Schaltfläche aus. Bei Haltestellen als Reiter wandern die beiden Schaltflächen in die Reiterleiste.`,layout:`Layout mehrerer Haltestellen`,layout_requires:`Wirkt erst ab zwei Haltestellen.`,layout_stacked:`Gestapelt`,layout_stacked_description:`Alle Haltestellen untereinander`,layout_tabs:`Reiter`,layout_tabs_description:`Eine Haltestelle je Reiter`,max_departures:`Anzahl Abfahrten pro Haltestelle`,max_departures_helper:`Standard sind 6. Bei 0 erscheint keine Abfahrtsliste.`,mode_badner:`Badner Bahn`,mode_bus:`Bus`,mode_hidden_aria:`{mode} ist ausgeblendet`,mode_metro:`U-Bahn`,mode_night:`NightLine`,mode_sbahn:`S-Bahn`,mode_shown_aria:`{mode} wird angezeigt`,mode_tram:`Straßenbahn`,pick_color_for_line:`Farbe für Linie {line} wählen`,reset_color:`Auf Standard zurücksetzen`,reset_color_aria:`Linienfarbe {line} auf Standard zurücksetzen`,section_colors:`Linienfarben`,section_disruptions:`Störungen & Verspätungen`,section_layout:`Aufbau`,section_transfers:`Umsteigemöglichkeiten`,show_accessibility:`Barrierefrei-Symbol anzeigen`,show_cooling:`Klimaanlagen-Symbol anzeigen`,show_cooling_helper:`Zeigt eine Schneeflocke neben Abfahrten mit klimatisiertem Fahrzeug. Wiener Linien melden das pro Fahrzeug — ältere Garnituren liefern die Angabe nicht.`,show_delay:`Verspätungen anzeigen`,show_delay_colors:`Verspätungen farblich hervorheben`,show_delay_colors_helper:`Färbt die Minutenzahl rot, wenn eine Abfahrt verspätet ist, und grün, wenn sie zu früh kommt.`,show_delay_colors_requires:`Braucht „Verspätungen anzeigen“.`,show_departure_time:`Voraussichtliche Abfahrtszeit anzeigen`,show_departure_time_helper:`Zeigt neben der Minutenzahl, wann das Fahrzeug abfahren sollte: bei der großen nächsten Abfahrt und in der Liste. Bei Verspätung steht die Planzeit durchgestrichen davor.`,show_departures:`Abfahrtsliste anzeigen`,show_elevator_info:`Aufzugsausfälle anzeigen`,show_hero_metric:`Nächste Abfahrt groß anzeigen`,show_platform:`Gleis/Steig anzeigen`,show_qr_button:`QR-Code-Schaltfläche anzeigen`,show_stop_times:`Voraussichtliche Ankunftszeiten anzeigen`,show_stop_times_helper:`Zeigt, wann das Fahrzeug jede weitere Station erreichen sollte: Echtzeit-Abfahrt plus Fahrzeit laut Fahrplan. Bei Verspätung steht die Planzeit durchgestrichen davor.`,show_stop_times_requires:`Braucht „Zwischenstationen anzeigen“.`,show_stops_ahead:`Zwischenstationen anzeigen`,show_traffic_info:`Störungen anzeigen`,show_type_icon:`Verkehrsmittel-Symbol anzeigen`,summary_alerts:`Störungen`,summary_all_modes:`Alle Verkehrsmittel`,summary_colors_changed:`{n} angepasst`,summary_colors_official:`Offizielle Farben`,summary_cooling:`Klima`,summary_credit_hidden:`Ohne Quellenangabe`,summary_credit_shown:`Mit Quellenangabe`,summary_delays:`Verspätungen`,summary_delays_colored:`Verspätungen farbig`,summary_departure_one:`1 Abfahrt`,summary_departures:`{n} Abfahrten`,summary_elevators:`Aufzüge`,summary_header_off:`Ohne Kopfzeile`,summary_hero:`Große Abfahrt`,summary_no_list:`Ohne Liste`,summary_no_modes:`Keine`,summary_off:`Aus`,summary_platform:`Steig`,summary_row_bare:`Nur Linie, Ziel und Zeit`,summary_some_modes:`{n} von {total}`,summary_step_free:`Barrierefrei`,summary_step_free_only:`Nur barrierefrei`,summary_stops_ahead:`Zwischenstationen`,summary_type_icon:`Verkehrsmittel`,transfer_modes_hint:`Diese Verkehrsmittel erscheinen als Chips neben den Zwischenstationen.`,transfer_modes_requires:`Braucht „Zwischenstationen anzeigen“.`},timetable_only:`nur Fahrplan`,timetable_title:`Fahrplanzeit, keine Echtzeitdaten`},retro:{editor:{accessibility_only:`Nur barrierefreie Abfahrten anzeigen`,bloom:`Stärkeres LED-Leuchten`,bloom_helper:`Heller Kern und weicher Lichthof um die leuchtende Schrift, so wie eine echte LED-Anzeige leuchtet.`,chips:`Zusätzliche Beschriftungen`,date_format:`Datumsformat`,exit:`Ausgangssymbol`,extra_icons:`Zusätzliche Symbole`,flicker:`LED-Flackern simulieren`,header_exit_accessible:`Stufenloser Ausgang`,header_exit_none:`Kein`,header_exit_regular:`Ausgang`,housing:`LED-Gehäuserahmen anzeigen`,housing_helper:`Dunkler Rahmen um die LED-Anzeige mit dezentem Glas-Reflex obenauf.`,icon_mdi_door_open:`Offene Tür`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_stairs:`Treppe`,line_stripe:`Seitlichen Linienstreifen anzeigen`,line_stripe_helper:`4-Pixel-Balken am linken Rand jeder Zeile in der Linienfarbe.`,message_text:`Nachricht`,message_text_requires:`Braucht „Lauftext anzeigen“.`,message_ticker:`Laufschrift`,message_ticker_helper:`Zeigt alle 5 Minuten eine eigene Nachricht als Laufschrift über die Anzeige.`,platform_side:`Gleis/Steig-Seite`,platform_side_auto:`Automatisch (1 = rechts, 2 = links)`,platform_side_helper:`Standard folgt der Wiener-Linien-Beschilderung (Gleis 2 links, sonst rechts). Manuell überschreibbar.`,platform_side_left:`Immer links`,platform_side_requires:`Braucht „Steig anzeigen“.`,platform_side_right:`Immer rechts`,show_clock:`Uhr-Plakette anzeigen`,show_date:`Datums-Plakette anzeigen`,show_header:`Stationsanzeige anzeigen`,show_header_helper:`Hauptschalter. Einstellungen pro Seite bleiben gespeichert.`,show_line_pill:`Linien-Plakette anzeigen`,show_line_pill_helper:`Liniencode als gefüllte Plakette in der Linienfarbe statt als schlichter Text.`,show_platform:`Steig anzeigen`,show_station_name:`Stationsnamen anzeigen`,show_unit:`Einheit „min“ anzeigen`,show_unit_helper:`Kleines „min“ in Amber-Versalien nach jeder Minutenzahl.`,size:`Größe`,station_bg:`Stationsschild-Hintergrund`,station_bg_black:`Schwarz`,station_bg_default:`Standard`,station_bg_white:`Weiß`,style:`Stil`,style_classic:`Klassisch`,style_pixel:`Punktmatrix`,style_warm:`Warm`,text:`Beschriftung`,wheelchair_race:`Rollstuhl-Rennen (Easter Egg)`},aria_dismiss_message:`Lauftext schließen`,aria_start_race:`Barrierefreiheits-Rennen starten`,at_platform:`Einfahrt`,barrier_free_title:`Barrierefrei zugänglich`,betriebsschluss:`Betriebsschluss`,countdown_minutes:`{n} Minuten`,departures_list:`Kommende Abfahrten`,dir_both:`Beide`,dir_h:`Hinfahrt`,dir_h_short:`H`,dir_r:`Rückfahrt`,dir_r_short:`R`,entity_missing:`Sensor {entity} existiert nicht mehr. Wähle oben einen anderen Sensor.`,gleis:`GLEIS`,header:{icon_exit:`Ausgang`,icon_exit_access:`Stufenloser Ausgang`,icon_wc:`WC`,icon_escalator:`Rolltreppe`,icon_elevator:`Aufzug`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_door_open:`Offene Tür`,icon_mdi_stairs:`Treppe`},no_data:`Keine Abfahrten`,no_data_wrong_direction:`Keine Abfahrten in dieser Richtung`,no_data_wrong_line:`Keine Abfahrten für diese Linie`,no_entity:`Keine Haltestelle ausgewählt`,race_finished:`Barrierefreiheits-Rennen beendet`,race_starting_in:`Rennen startet in {n}`,race_winner_announce:`Rollstuhl {n} gewinnt das Barrierefreiheits-Rennen`,stale_feed:`Keine aktuellen Daten`,steig:`STEIG`,unavailable:`Keine Verbindung`,unit_min:`min`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.`,version_update:`Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden`,via_prefix:`ÜBER`,timetable_title:`Fahrplanzeit, keine Echtzeitdaten`},flap:{no_entity:`Keine Haltestelle ausgewählt`,no_data:`Keine Abfahrten`,no_data_wrong_direction:`Keine Abfahrten in dieser Richtung`,no_data_wrong_line:`Keine Abfahrten für diese Linie`,betriebsschluss:`Betriebsschluss`,stale_feed:`Keine aktuellen Daten`,unavailable:`Keine Verbindung`,dir_h:`Hinfahrt`,dir_r:`Rückfahrt`,dir_h_short:`H`,dir_r_short:`R`,gleis:`GLEIS`,steig:`STEIG`,col_line:`LINIE`,col_dest:`RICHTUNG`,col_step_free:`STUFENLOS`,col_cd:`ANKUNFT`,version_update:`Klappanzeige wurde auf v{v} aktualisiert — bitte neu laden`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.`,entity_missing:`Sensor {entity} existiert nicht mehr. Wähle einen anderen Sensor oder entferne ihn aus den Haltestellen dieser Karte.`,departures_list:`Kommende Abfahrten`,at_platform:`Einfahrt`,countdown_minutes:`{n} Minuten`,barrier_free_title:`Barrierefrei zugänglich`,not_barrier_free_title:`Nicht barrierefrei`,unit_min:`min`,dir_both:`Beide`,header:{icon_exit:`Ausgang`,icon_exit_access:`Stufenloser Ausgang`,icon_wc:`WC`,icon_escalator:`Rolltreppe`,icon_elevator:`Aufzug`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_door_open:`Offene Tür`,icon_mdi_stairs:`Treppe`},editor:{accessibility_only:`Nur barrierefreie Abfahrten anzeigen`,accessibility_only_requires:`Braucht „Rollstuhl-Plakette anzeigen“.`,chips:`Zusätzliche Beschriftungen`,date_format:`Datumsformat`,exit:`Ausgangssymbol`,extra_icons:`Zusätzliche Symbole`,header_exit_accessible:`Stufenloser Ausgang`,header_exit_none:`Kein`,header_exit_regular:`Ausgang`,hide_attribution:`Datenquelle ausblenden`,hide_attribution_helper:`Wenn aktiv, wird die CC-BY-Quellenangabe am unteren Rand der Karte ausgeblendet. Die OGD-Lizenz der Wiener Linien verlangt eine sichtbare Quellenangabe, sofern der Hinweis nicht an anderer Stelle im Dashboard erscheint.`,housing:`Gehäuserahmen anzeigen`,housing_helper:`Umrahmt die Tafel mit dem Gehäuse inkl. dezenter Innenkante und Schlagschatten. Gehäusefarbe folgt dem HA-Theme (cremefarben im Hellmodus, dunkel im Dunkelmodus). Aus = Tafel sitzt bündig auf dem Dashboard.`,icon_mdi_door_open:`Offene Tür`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_stairs:`Treppe`,max_rows:`Anzahl Zeilen`,max_rows_helper:`Wie viele Abfahrten die Tafel zeigt (1–8). Über alle Haltestellen zusammengeführt, nach Abfahrtszeit sortiert.`,show_accessibility:`Rollstuhl-Plakette anzeigen`,show_accessibility_helper:`Zeigt eine Rollstuhl-Plakette neben barrierefreien Abfahrten.`,show_clock:`Uhr-Plakette anzeigen`,show_date:`Datums-Plakette anzeigen`,show_header:`Stationsanzeige anzeigen`,show_header_helper:`Hauptschalter. Einstellungen pro Seite bleiben gespeichert.`,show_line_column:`Linienspalte anzeigen`,show_line_column_helper:`Zeigt die Spalte mit dem Liniencode. Ausschalten, wenn die Tafel ohnehin nur eine Linie zeigt.`,show_min_unit:`Einheit „min“ anzeigen`,show_min_unit_helper:`Kleines „min“ neben der Minutenzahl, wie auf echten Stationstafeln.`,show_platform:`Gleis/Steig anzeigen`,show_platform_helper:`Fügt jeder Zeile eine eigene Gleis-Plakette zwischen Ziel und Minutenzahl hinzu. Wird nur eingeblendet, wenn mindestens eine sichtbare Zeile einen Gleis-Wert hat.`,show_station_name:`Stationsnamen anzeigen`,show_station_name_helper:`Farbiges Band mit Stationsname und Uhrzeit am oberen Rand der Karte.`,size:`Größe`,station_bg:`Hintergrund Stationsschild`,station_bg_black:`Schwarz`,station_bg_helper:`Standard ist die Farbe der ersten erfassten Linie (z. B. Rot für U1, Orange für U3). Bei mehreren Linien kann eine bestimmte Linie gewählt oder auf Weiß bzw. Schwarz umgestellt werden.`,station_bg_line:`Erste Linie`,station_bg_white:`Weiß`,text:`Beschriftung`},timetable_title:`Fahrplanzeit, keine Echtzeitdaten`},route:{heading_fallback:`Verbindung`,arrival:`Ankunft`,open_in_city_map:`Im Stadtplan öffnen`,find_on_map:`In Karte suchen`,leave_in:`Abfahrt in`,now:`Jetzt`,minutes:`{n} min`,minutes_long:`{n} Minuten`,direct:`Direkt`,changes_one:`1 Umstieg`,changes_many:`{n} Umstiege`,platform_track:`Gleis {p}`,platform_stop:`Steig {p}`,stops_one:`1 Station`,stops_many:`{n} Stationen`,walk:`{n} min Fußweg`,towards:`Richtung {towards}`,late:`{n} min später`,risk_ok:`{n} min Puffer`,risk_tight:`Knapp: {n} min Puffer`,risk_at_risk:`Anschluss gefährdet: {n} min zu wenig`,transfer:`Umstieg`,replan_from_here:`Ab hier suchen`,replan_from_here_label:`Andere Verbindung ab {stop} suchen`,replan_announce:`Suche Verbindungen ab {stop}.`,replan_back:`Zurück zu {stop}`,alternatives:`Weitere Verbindungen ({n})`,disruption:`Störung`,inactive:`Außerhalb des Zeitfensters`,inactive_detail:`Aktualisiert {when}.`,no_trips:`Gerade keine Verbindung`,no_trips_detail:`Der Routenplaner findet nichts. Die nächste Aktualisierung versucht es erneut.`,unavailable:`Routenplaner nicht erreichbar`,unavailable_detail:`Verbindungen erscheinen wieder, sobald er antwortet.`,entity_missing:`Sensor {entity} existiert nicht mehr. Wähle im Editor eine andere Verbindung.`,trip_summary:`{dep} bis {arr}, {changes}`,version_update:`Verbindungskarte wurde auf v{v} aktualisiert — bitte neu laden`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.`,updated:`Zuletzt aktualisiert {time}`,adhoc_heading:`Verbindung suchen`,adhoc_legend:`Start und Ziel`,adhoc_from:`Von`,adhoc_to:`Nach`,adhoc_swap:`Start und Ziel tauschen`,adhoc_stops_loading:`Haltestellen werden geladen …`,adhoc_pick:`Wähle Start und Ziel`,adhoc_pick_detail:`Die nächsten Verbindungen erscheinen, sobald beides gewählt ist.`,adhoc_loading:`Suche Verbindungen …`,adhoc_no_trips:`Keine Verbindung gefunden`,adhoc_no_trips_detail:`Probier eine andere Haltestelle oder versuch es später nochmal.`,adhoc_stale:`Gerade zu viele Verbindungsabfragen, darum ein etwas älterer Stand.`,adhoc_paused:`Aktualisierung pausiert`,adhoc_resume:`Wieder aktualisieren`,adhoc_announce:`Abfahrt in {n} Minuten. {summary}`,adhoc_announce_now:`Abfahrt jetzt. {summary}`,adhoc_no_match:`Keine passende Haltestelle. Wähle einen Vorschlag aus der Liste.`,adhoc_show_stops:`Haltestellen anzeigen`,adhoc_no_results:`Keine Haltestelle gefunden`,adhoc_matches:`{n} Treffer`,adhoc_matches_more:`{shown} von {total} Treffern. Tipp weiter, um einzugrenzen.`,adhoc_error_same_stop:`Start und Ziel sind dieselbe Haltestelle`,adhoc_error_same_stop_detail:`Wähle ein anderes Ziel.`,adhoc_error_upstream:`Routenplaner nicht erreichbar`,adhoc_error_retry_detail:`Neuer Versuch in {s}\xA0s.`,adhoc_error_rate_limited:`Gerade zu viele Verbindungsabfragen`,adhoc_error_not_loaded:`Wiener Linien Austria ist nicht geladen`,adhoc_error_not_loaded_detail:`Richte in der Integration eine Haltestelle oder Verbindung ein. Die Karte schaut jede Minute nach.`,adhoc_error_catalogue:`Haltestellenliste nicht verfügbar`,adhoc_error_invalid_stop:`Haltestelle nicht gefunden`,adhoc_error_invalid_stop_detail:`Wähle eine andere Haltestelle.`,adhoc_error_too_close:`Die Haltestellen liegen zu nah beieinander`,adhoc_error_too_close_detail:`Wähle Haltestellen, die weiter auseinander liegen.`,adhoc_error_stop_unknown:`Der Routenplaner kennt diese Haltestelle nicht`,adhoc_error_stop_unknown_detail:`Wähle eine andere Haltestelle.`,adhoc_error_no_timetable:`Für heute ist kein Fahrplan veröffentlicht`,adhoc_error_no_timetable_detail:`Die Karte schaut in ein paar Minuten wieder nach.`,adhoc_error_refused:`Der Routenplaner kann diese Verbindung nicht planen`,adhoc_error_refused_detail:`Wähle andere Haltestellen.`,adhoc_error_unknown:`Verbindungssuche fehlgeschlagen`,not_a_route:`Das ist ein Abfahrtsmonitor, keine Verbindung. Wähle im Editor eine Verbindung.`,when_legend:`Wann`,when_now:`Jetzt`,when_depart:`Abfahrt um`,when_arrive:`Ankunft bis`,when_input:`Datum und Uhrzeit`,page_legend:`Frühere oder spätere Verbindung`,page_earlier:`Früher`,page_later:`Später`,page_requests_left:`Noch\xA0{n}\xA0Abfragen`,page_requests_left_one:`Noch\xA01\xA0Abfrage`,page_wait:`Nächste Abfrage in\xA0{s}\xA0s`,page_every_seconds:`alle {s}\xA0s`,page_every_minute:`pro\xA0Minute`,page_why:`Bis zu {max} Abfragen am Stück, dann eine {every}. So schont die Karte den Routenplaner der Wiener Linien.`,page_why_label:`Mehr zum Limit`,page_refill_in:`+1\xA0in\xA0{s}\xA0s`,planned_departs:`Abfahrt {day}`,planned_arrives:`Ankunft {time}`,day_today:`heute`,day_tomorrow:`morgen`,adhoc_announce_planned:`Abfahrt {day} um {time}. {summary}`,live:`Echtzeit`,every_minutes:`alle {n} min`,then_at:`danach {times}`,access_elevator:`Aufzug`,access_elevator_up:`Aufzug nach oben`,access_elevator_down:`Aufzug nach unten`,access_stairs:`Stiegen`,access_stairs_up:`Stiegen hinauf`,access_stairs_down:`Stiegen hinunter`,access_escalator:`Rolltreppe`,access_escalator_up:`Rolltreppe nach oben`,access_escalator_down:`Rolltreppe nach unten`,access_ramp:`Rampe`,access_ramp_up:`Rampe hinauf`,access_ramp_down:`Rampe hinunter`,lift_out:`außer Betrieb`,lift_out_notice:`Aufzug außer Betrieb: {station}`,low_floor:`Niederflurfahrzeug`,stops_between:`Stationen dazwischen, {line}`,last_connection:`Letzte Verbindung ohne Nachtbus {time}`,planned_late:`geplant {time}, {n} min später`,next_catchable:`Nächster erreichbar: {time}`,editor:{entity:`Verbindung`,entity_helper:`Leer lassen, um Start und Ziel direkt auf der Karte zu wählen. Zur Wahl stehen nur eingerichtete Verbindungen.`,title:`Überschrift`,title_helper:`Leer lassen für „Start → Ziel“.`,alternatives:`Weitere Verbindungen`,alternatives_helper:`Wie viele spätere Verbindungen unter der besten stehen. 0 blendet sie aus.`,replan_from_change:`Ab Umstieg neu suchen`,replan_from_change_helper:`Ein Button an jedem Umstieg sucht, was ab dieser Station weiterfährt. Hilft vor allem, wenn ein Anschluss knapp ist.`,show_map_pins:`Karten-Pins anzeigen`,show_map_pins_helper:`Ein Pin nach jeder Einstiegshaltestelle und nach dem Ziel öffnet die Haltestelle im Stadtplan.`,hide_attribution:`Datenquelle ausblenden`,hide_attribution_helper:`Die OGD-Lizenz der Wiener Linien verlangt eine sichtbare Quellenangabe, sofern sie nicht an anderer Stelle im Dashboard steht.`,no_routes:`Noch keine Verbindung eingerichtet. Start und Ziel lassen sich direkt auf der Karte wählen, oder du richtest eine feste Verbindung ein.`,add_route:`Verbindung einrichten`,from:`Vorauswahl Start`,from_helper:`Gilt, bis jemand auf diesem Gerät eine andere Haltestelle wählt.`,to:`Vorauswahl Ziel`,to_helper:`Gilt, bis jemand auf diesem Gerät eine andere Haltestelle wählt.`,step_free:`Stufenlos`,step_free_helper:`Nur Verbindungen mit Aufzug oder Rampe statt Stiegen und Rolltreppen, und mit Niederflurfahrzeugen.`}}},en:{common:{picker:{picker_modern:`Departures with disruptions and lift status`,picker_retro:`LED display like the ones at Wiener Linien stations`,picker_flap:`Departures on a split-flap board`,picker_route:`Next connection from A to B, with time to spare at each change`},editor:{add_chip:`Add chip`,add_icon:`Add icon`,date_format_placeholder:`d.m.Y`,direction_label:`Direction`,direction_not_served:`not served`,direction_note_one_way:`Return direction disabled: {line} terminates here.`,direction_unavailable:`No departures in this direction`,entities:`Stops`,entity:`Stop`,header_amenities:`Icons in this slot`,header_bar_aria:`Station sign — choose a side`,header_chips_and_icons:`Text chips (max. {chips}) and extra icons (max. {icons})`,header_left:`Left side`,header_pick_side_hint:`Tap a side, then fill it in below`,header_right:`Right side`,header_side_aria:`Station sign side`,header_slot_empty:`empty`,line_active_aria:`Line {line} active`,line_inactive_aria:`Line {line} inactive`,lines_empty_means_all:`empty = all lines`,lines_label:`Lines at this stop`,lines_selected:`{n} of {total}`,no_lines_hint:`Lines appear as soon as this stop reports departures.`,no_lines_title:`No lines yet`,per_line_direction_aria:`Line {line}: {direction}`,remove_chip_aria:`Remove chip {chip}`,remove_icon_aria:`Remove icon {icon}`,remove_stop:`Remove stop`,section_board:`Split-flap board`,section_departure_row:`Departure row`,section_extras:`Extras`,section_extras_hint:`optional`,section_footer:`Footer`,section_header:`Station sign`,section_header_hint:`Edit on the bar`,section_led_panel:`LED panel`,section_station:`Station band`,section_walk_time:`Walking time to the stop`,show_clock_short:`Clock`,show_date_short:`Date`,show_elevator_short:`Elevator`,show_escalator_short:`Escalator`,show_wc_short:`WC`,size_medium:`Medium`,size_regular:`Standard`,size_small:`Small`,tab_display:`Display`,tab_stop:`Stop`,tab_stops:`Stops`,tab_tweaks:`Style`,text_placeholder:`e.g. name of the next station`,walk_time_aria:`Walking time in minutes for line {line} towards {towards}`,walk_time_branching_hint:`Applies to every terminus in this direction`,walk_time_hint:`Hides departures that would leave without you. Empty = no filter.`,walk_time_less_aria:`Decrease walking time for line {line}`,walk_time_more_aria:`Increase walking time for line {line}`,walk_time_placeholder:`–`,walk_time_unit:`minutes`}},modern:{no_data:`No departures available`,betriebsschluss:`End of service`,unavailable:`Can't reach Wiener Linien`,unavailable_detail:`Nothing to do on your side. Departures come back as soon as Wiener Linien answers.`,stale_feed:`No live data`,stale_feed_detail:`Wiener Linien is sending out-of-date departure times for this stop. Departures return automatically once live data resumes.`,stale_feed_since:`Last reported departure: {time}`,stale_feed_partial:`Some lines aren't reporting current times.`,connection_lost_partial:`No connection to Wiener Linien since {time}. The times below aren't current.`,min:`min`,now:`Now`,platform_short_rail:`Track`,platform_short_bus:`Bay`,version_update:`Wiener Linien Austria updated to v{v} — please reload`,version_reload:`Reload`,version_reload_stuck:`Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.`,entity_missing:`Sensor {entity} no longer exists. Pick a different sensor, or remove it from this card's stops.`,no_entities_picked:`No stop selected`,no_entities_available:`No Wiener Linien sensors found`,departures_list:`Upcoming departures`,barrier_free_title:`Step-free access`,cooling_title:`Air conditioned`,disturbance_title:`Traffic disruption reported`,stops_ahead_aria_show:`Show stops ahead for {line} towards {towards}`,stops_ahead_aria_hide:`Hide stops ahead for {line} towards {towards}`,stops_ahead_other_show:`Show {count} more lines at {stop}`,stops_ahead_other_hide:`Hide other lines at {stop}`,departure_time_title:`Estimated departure`,stop_time_title:`Estimated arrival`,stop_time_late:`scheduled {time}, {n} min late`,stop_skipped:`No stop`,stop_skipped_until:`No stop until {date}`,stop_skipped_until_time:`No stop until {time}`,dir_h:`Outbound`,dir_r:`Return`,dir_h_short:`H`,dir_r_short:`R`,dir_both:`Both`,traffic_label:`Disruption`,traffic_until:`Until`,traffic_updated:`updated`,elevator_until:`Until`,open_in_maps:`Open in maps`,qr_open:`Show QR code`,qr_dialog_title:`QR code for stop`,qr_dialog_hint:`Scan with your phone — opens the stop in your maps app.`,qr_dialog_close:`Close QR code`,delay_singular:`1 min. late`,delay_plural:`{n} min. late`,devmode_title:`DEV`,devmode_traffic_btn:`Test disruption`,devmode_elevator_btn:`Test elevator`,devmode_colors_btn:`Line colours`,devmode_clear_btn:`Clear`,editor:{accessibility_only:`Only show step-free departures`,accessibility_only_requires:`Requires “Show step-free icon”.`,colors_empty_hint:`Pick stops on the Stops tab — their lines will show up here.`,colors_hint:`Optional. Without an override the official line colour applies.`,hide_attribution:`Hide data source`,hide_attribution_helper:`When on, the CC-BY credit at the bottom of the card is hidden. The Wiener Linien Open Government Data licence requires visible attribution unless you keep the credit elsewhere on the dashboard.`,hide_header:`Hide header`,hide_header_helper:`Hides the row with the stop name and the map and QR-code buttons. With stops as tabs, the two buttons move to the tab strip.`,layout:`Multi-stop layout`,layout_requires:`Only takes effect with two or more stops.`,layout_stacked:`Stacked`,layout_stacked_description:`Every stop, one below the other`,layout_tabs:`Tabs`,layout_tabs_description:`One stop per tab`,max_departures:`Departures per stop`,max_departures_helper:`6 by default. At 0 no departure list is shown.`,mode_badner:`Badner Bahn`,mode_bus:`Bus`,mode_hidden_aria:`{mode} hidden`,mode_metro:`Metro`,mode_night:`NightLine`,mode_sbahn:`S-Bahn`,mode_shown_aria:`{mode} shown`,mode_tram:`Tram`,pick_color_for_line:`Pick colour for line {line}`,reset_color:`Reset to default`,reset_color_aria:`Reset line colour {line} to default`,section_colors:`Line colours`,section_disruptions:`Disruptions & delays`,section_layout:`Layout`,section_transfers:`Transfer options`,show_accessibility:`Show step-free icon`,show_cooling:`Show air-conditioning icon`,show_cooling_helper:`Shows a snowflake beside departures with an air-conditioned vehicle. Wiener Linien report this per vehicle — older trains and trams don't send it.`,show_delay:`Show delays`,show_delay_colors:`Colour-code delays`,show_delay_colors_helper:`Turns the countdown number red when a departure runs late and green when it runs early.`,show_delay_colors_requires:`Requires “Show delays”.`,show_departure_time:`Show estimated departure time`,show_departure_time_helper:`Shows when the vehicle should leave, next to the countdown: in the large next departure and in the list. A late departure shows the scheduled time struck through.`,show_departures:`Show departure list`,show_elevator_info:`Show elevator outages`,show_hero_metric:`Show next departure large`,show_platform:`Show platform / track`,show_qr_button:`Show QR-code button`,show_stop_times:`Show estimated arrival times`,show_stop_times_helper:`Shows when the vehicle should reach each stop ahead: its live departure plus the scheduled travel time. A late departure shows the scheduled time struck through.`,show_stop_times_requires:`Requires “Show intermediate stops”.`,show_stops_ahead:`Show intermediate stops`,show_traffic_info:`Show disruption alerts`,show_type_icon:`Show vehicle-type icon`,summary_alerts:`Alerts`,summary_all_modes:`All modes`,summary_colors_changed:`{n} changed`,summary_colors_official:`Official colours`,summary_cooling:`Air-con`,summary_credit_hidden:`No credit`,summary_credit_shown:`Credit shown`,summary_delays:`Delays`,summary_delays_colored:`Delays in colour`,summary_departure_one:`1 departure`,summary_departures:`{n} departures`,summary_elevators:`Elevators`,summary_header_off:`No header`,summary_hero:`Large departure`,summary_no_list:`No list`,summary_no_modes:`None`,summary_off:`Off`,summary_platform:`Platform`,summary_row_bare:`Line, destination and time only`,summary_some_modes:`{n} of {total}`,summary_step_free:`Step-free`,summary_step_free_only:`Step-free only`,summary_stops_ahead:`Stops ahead`,summary_type_icon:`Vehicle type`,transfer_modes_hint:`These modes appear as chips beside each intermediate stop.`,transfer_modes_requires:`Requires “Show intermediate stops”.`},timetable_only:`Timetable only`,timetable_title:`Scheduled time, no live data`},retro:{editor:{accessibility_only:`Only show step-free departures`,bloom:`Stronger LED glow`,bloom_helper:`A bright core and a soft halo around the lit text, the way a real LED sign glows.`,chips:`Extra labels`,date_format:`Date format`,exit:`Exit icon`,extra_icons:`Extra icons`,flicker:`Simulate LED flicker`,header_exit_accessible:`Step-free exit`,header_exit_none:`None`,header_exit_regular:`Exit`,housing:`Show LED cabinet frame`,housing_helper:`Dark bezel around the LED panel with a subtle glass reflection on top.`,icon_mdi_door_open:`Open door`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_stairs:`Stairs`,line_stripe:`Show line stripe`,line_stripe_helper:`A 4 px coloured bar at the left edge of each row, matched to the line.`,message_text:`Message`,message_text_requires:`Requires “Show ticker”.`,message_ticker:`Scrolling message`,message_ticker_helper:`Runs a custom message across the display every 5 minutes.`,platform_side:`Platform side`,platform_side_auto:`Auto (1 = right, 2 = left)`,platform_side_helper:`Default follows Wiener Linien signage (platform 2 on the left, otherwise right). Override manually if needed.`,platform_side_left:`Always left`,platform_side_requires:`Requires “Show platform”.`,platform_side_right:`Always right`,show_clock:`Show clock chip`,show_date:`Show date chip`,show_header:`Show station sign`,show_header_helper:`Master switch. Per-side settings are kept.`,show_line_pill:`Show line badge`,show_line_pill_helper:`Renders the line code as a filled badge in the line colour rather than plain text.`,show_platform:`Show platform`,show_station_name:`Show station name`,show_unit:`Show the “min” unit`,show_unit_helper:`Trail each countdown number with a small amber "min" caption.`,size:`Size`,station_bg:`Station-name background`,station_bg_black:`Black`,station_bg_default:`Default`,station_bg_white:`White`,style:`Style`,style_classic:`Classic`,style_pixel:`Dot matrix`,style_warm:`Warm`,text:`Sign text`,wheelchair_race:`Wheelchair race (easter egg)`},aria_dismiss_message:`Dismiss scrolling message`,aria_start_race:`Start accessibility race`,at_platform:`Arriving`,barrier_free_title:`Step-free access`,betriebsschluss:`End of service`,countdown_minutes:`{n} minutes`,departures_list:`Upcoming departures`,dir_both:`Both`,dir_h:`Outbound`,dir_h_short:`H`,dir_r:`Return`,dir_r_short:`R`,entity_missing:`Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.`,gleis:`PLATF.`,header:{icon_exit:`Exit`,icon_exit_access:`Step-free exit`,icon_wc:`Toilet`,icon_escalator:`Escalator`,icon_elevator:`Elevator`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_door_open:`Open door`,icon_mdi_stairs:`Stairs`},no_data:`No departures`,no_data_wrong_direction:`No departures in this direction`,no_data_wrong_line:`No departures for this line`,no_entity:`No stop selected`,race_finished:`Accessibility race finished`,race_starting_in:`Race starting in {n}`,race_winner_announce:`Wheelchair {n} wins the accessibility race`,stale_feed:`No live data`,steig:`BAY`,unavailable:`No connection`,unit_min:`min`,version_reload:`Reload`,version_reload_stuck:`Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.`,version_update:`Retro card updated to v{v} — please reload`,via_prefix:`VIA`,timetable_title:`Scheduled time, no live data`},flap:{no_entity:`No stop selected`,no_data:`No departures`,no_data_wrong_direction:`No departures in this direction`,no_data_wrong_line:`No departures for this line`,betriebsschluss:`End of service`,stale_feed:`No live data`,unavailable:`No connection`,dir_h:`Outbound`,dir_r:`Return`,dir_h_short:`H`,dir_r_short:`R`,gleis:`PLATF.`,steig:`BAY`,col_line:`LINE`,col_dest:`DIRECTION`,col_step_free:`STEP-FREE`,col_cd:`ARRIVAL`,version_update:`Flap card updated to v{v} — please reload`,version_reload:`Reload`,version_reload_stuck:`Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.`,entity_missing:`Sensor {entity} no longer exists. Pick a different sensor, or remove it from this card's stops.`,departures_list:`Upcoming departures`,at_platform:`Arriving`,countdown_minutes:`{n} minutes`,barrier_free_title:`Step-free access`,not_barrier_free_title:`Step-free access not available`,unit_min:`min`,dir_both:`Both`,header:{icon_exit:`Exit`,icon_exit_access:`Step-free exit`,icon_wc:`Toilet`,icon_escalator:`Escalator`,icon_elevator:`Elevator`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_door_open:`Open door`,icon_mdi_stairs:`Stairs`},editor:{accessibility_only:`Only show step-free departures`,accessibility_only_requires:`Requires “Show wheelchair badge”.`,chips:`Extra labels`,date_format:`Date format`,exit:`Exit icon`,extra_icons:`Extra icons`,header_exit_accessible:`Step-free exit`,header_exit_none:`None`,header_exit_regular:`Exit`,hide_attribution:`Hide data source`,hide_attribution_helper:`When on, the CC-BY credit at the bottom of the card is hidden. The Wiener Linien Open Government Data licence requires visible attribution unless you keep the credit elsewhere on the dashboard.`,housing:`Show cabinet frame`,housing_helper:`Wraps the board in the cabinet with a soft inset bevel and drop shadow. Cabinet colour follows your HA theme (cream on light, dark on dark). When off, the board sits flush against the dashboard.`,icon_mdi_door_open:`Open door`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_stairs:`Stairs`,max_rows:`Number of rows`,max_rows_helper:`How many departures to show on the board (1–8). Merged across all stops, sorted by countdown.`,show_accessibility:`Show step-free tile`,show_accessibility_helper:`Add a wheelchair pictogram tile next to step-free departures.`,show_clock:`Show clock chip`,show_date:`Show date chip`,show_header:`Show station sign`,show_header_helper:`Master switch. Per-side settings are kept.`,show_line_column:`Show line column`,show_line_column_helper:`Shows the column carrying the line code. Turn it off when the board only ever shows one line.`,show_min_unit:`Show "min" caption`,show_min_unit_helper:`Small label next to the countdown number, like real station boards.`,show_platform:`Show platform / track`,show_platform_helper:`Adds a per-row platform tile between the destination and the countdown. Only shown when at least one visible row has a platform value.`,show_station_name:`Show station name`,show_station_name_helper:`Coloured band with the station name and current time at the top of the card.`,size:`Size`,station_bg:`Station-name background`,station_bg_black:`Black`,station_bg_helper:`Default is the colour of the first tracked line (e.g. red for U1, orange for U3). On multi-line boards you can pick a specific line, or override with solid white or black.`,station_bg_line:`First line`,station_bg_white:`White`,text:`Sign text`},timetable_title:`Scheduled time, no live data`},route:{heading_fallback:`Route`,arrival:`Arrival`,open_in_city_map:`Open in city map`,find_on_map:`Find on map`,leave_in:`Leave in`,now:`Now`,minutes:`{n} min`,minutes_long:`{n} minutes`,direct:`Direct`,changes_one:`1 change`,changes_many:`{n} changes`,platform_track:`Platform {p}`,platform_stop:`Stop {p}`,stops_one:`1 stop`,stops_many:`{n} stops`,walk:`{n} min walk`,towards:`towards {towards}`,late:`{n} min late`,risk_ok:`{n} min to spare`,risk_tight:`Tight: {n} min to spare`,risk_at_risk:`Connection at risk: {n} min short`,transfer:`Change`,replan_from_here:`Search from here`,replan_from_here_label:`Find another connection from {stop}`,replan_announce:`Searching for connections from {stop}.`,replan_back:`Back to {stop}`,alternatives:`More connections ({n})`,disruption:`Disruption`,inactive:`Outside the refresh window`,inactive_detail:`Updates {when}.`,no_trips:`No connection right now`,no_trips_detail:`The trip planner found nothing. The next update tries again.`,unavailable:`Can't reach the trip planner`,unavailable_detail:`Connections come back as soon as it answers.`,entity_missing:`Sensor {entity} no longer exists. Pick another route in the editor.`,trip_summary:`{dep} to {arr}, {changes}`,version_update:`Route card updated to v{v} — please reload`,version_reload:`Reload`,version_reload_stuck:`Reloading didn't pick up the new version. Close this browser tab and open the dashboard again, or clear the site data for Home Assistant in your browser settings.`,updated:`Last updated {time}`,adhoc_heading:`Plan a trip`,adhoc_legend:`Origin and destination`,adhoc_from:`From`,adhoc_to:`To`,adhoc_swap:`Swap origin and destination`,adhoc_stops_loading:`Loading stops …`,adhoc_pick:`Pick an origin and a destination`,adhoc_pick_detail:`The next connections show up once both are set.`,adhoc_loading:`Finding connections …`,adhoc_no_trips:`No connection found`,adhoc_no_trips_detail:`Try another stop, or try again later.`,adhoc_stale:`Too many route requests right now, so this is a slightly older plan.`,adhoc_paused:`Updates paused`,adhoc_resume:`Resume updates`,adhoc_announce:`Leave in {n} minutes. {summary}`,adhoc_announce_now:`Leave now. {summary}`,adhoc_no_match:`No matching stop. Pick a suggestion from the list.`,adhoc_show_stops:`Show stops`,adhoc_no_results:`No stop found`,adhoc_matches:`Matches: {n}`,adhoc_matches_more:`Showing {shown} of {total}. Keep typing to narrow it down.`,adhoc_error_same_stop:`Origin and destination are the same stop`,adhoc_error_same_stop_detail:`Pick a different destination.`,adhoc_error_upstream:`Can't reach the trip planner`,adhoc_error_retry_detail:`Trying again in {s}\xA0s.`,adhoc_error_rate_limited:`Too many route requests right now`,adhoc_error_not_loaded:`Wiener Linien Austria isn't loaded`,adhoc_error_not_loaded_detail:`Set up a stop or a route in the integration. The card checks again every minute.`,adhoc_error_catalogue:`Stop list unavailable`,adhoc_error_invalid_stop:`Stop not found`,adhoc_error_invalid_stop_detail:`Pick another stop.`,adhoc_error_too_close:`These stops are too close together`,adhoc_error_too_close_detail:`Pick stops further apart.`,adhoc_error_stop_unknown:`The trip planner doesn't know this stop`,adhoc_error_stop_unknown_detail:`Pick a different stop.`,adhoc_error_no_timetable:`No timetable published for today`,adhoc_error_no_timetable_detail:`The card checks again in a few minutes.`,adhoc_error_refused:`The trip planner can't plan this trip`,adhoc_error_refused_detail:`Pick different stops.`,adhoc_error_unknown:`Trip search failed`,not_a_route:`This is a departure board, not a route. Pick a route in the editor.`,when_legend:`When`,when_now:`Now`,when_depart:`Depart at`,when_arrive:`Arrive by`,when_input:`Date and time`,page_legend:`Earlier or later connection`,page_earlier:`Earlier`,page_later:`Later`,page_requests_left:`{n}\xA0requests\xA0left`,page_requests_left_one:`1\xA0request\xA0left`,page_wait:`Next request in\xA0{s}\xA0s`,page_every_seconds:`every {s}\xA0s`,page_every_minute:`a\xA0minute`,page_why:`Up to {max} requests in a row, then one {every}, so the card goes easy on the Wiener Linien trip planner.`,page_why_label:`About the limit`,page_refill_in:`+1\xA0in\xA0{s}\xA0s`,planned_departs:`Leave {day}`,planned_arrives:`Arrive {time}`,day_today:`today`,day_tomorrow:`tomorrow`,adhoc_announce_planned:`Leave {day} at {time}. {summary}`,live:`Live`,every_minutes:`every {n} min`,then_at:`then {times}`,access_elevator:`Lift`,access_elevator_up:`Lift up`,access_elevator_down:`Lift down`,access_stairs:`Stairs`,access_stairs_up:`Stairs up`,access_stairs_down:`Stairs down`,access_escalator:`Escalator`,access_escalator_up:`Escalator up`,access_escalator_down:`Escalator down`,access_ramp:`Ramp`,access_ramp_up:`Ramp up`,access_ramp_down:`Ramp down`,lift_out:`out of service`,lift_out_notice:`Lift out of service: {station}`,low_floor:`Low-floor vehicle`,stops_between:`Stops in between, {line}`,last_connection:`Last connection without night bus {time}`,planned_late:`scheduled {time}, {n} min late`,next_catchable:`Next you can catch: {time}`,editor:{entity:`Route`,entity_helper:`Leave empty to pick origin and destination right on the card. Only routes you've set up are listed.`,title:`Heading`,title_helper:`Leave empty for “Start → Destination”.`,alternatives:`More connections`,alternatives_helper:`How many later connections to list under the best one. 0 hides them.`,replan_from_change:`Search again from a change`,replan_from_change_helper:`A button at each change looks up what else goes onward from that stop. Most useful when a connection is tight.`,show_map_pins:`Show map pins`,show_map_pins_helper:`A pin after each boarding stop and the destination opens that stop on the city map.`,hide_attribution:`Hide data source`,hide_attribution_helper:`The Wiener Linien OGD licence requires a visible credit unless it appears elsewhere on the dashboard.`,no_routes:`No route set up yet. You can pick origin and destination right on the card, or set up a fixed route.`,add_route:`Set up a route`,from:`Preselected origin`,from_helper:`Applies until someone picks another stop on this device.`,to:`Preselected destination`,to_helper:`Applies until someone picks another stop on this device.`,step_free:`Step-free`,step_free_helper:`Only connections with lifts or ramps instead of stairs and escalators, and with low-floor vehicles.`}}}},Ze=Xe.de??{};function Qe(e,t){return e.split(`.`).reduce((e,t)=>{if(e&&typeof e==`object`&&t in e)return e[t]},t)}function $e(e,t){let n=Qe(e,t);return typeof n==`string`?n:void 0}function et(e){return((e.configLanguage||e.hassLanguage||`de`).split(/[-_]/)[0]??`de`)===`en`?`en`:`de`}function L(e,t,n){let r=$e(e,Xe[et(t)]??Ze);if(r===void 0&&(r=$e(e,Ze)),r===void 0)return e;if(n)for(let[e,t]of Object.entries(n))r=r.replace(`{${e}}`,String(t));return r}function tt(e){let t;try{let e=window.localStorage?.getItem(`selectedLanguage`);t=e?JSON.parse(e):void 0}catch{t=void 0}let n=document.documentElement.lang||t||navigator.language||void 0;return L(`common.picker.${e}`,{hassLanguage:n})}function nt(e,t,n){let r=t.et(n);return r===n?e?.localize?.(`ui.panel.lovelace.editor.card.generic.${n}`)||n:r}function rt(e,t,n){let r=n?.[t];if(r!==void 0)return r;let i=`${t}_helper`,a=e.et(i);return a===i?void 0:a}function it(e,t){let n={hassLanguage:t};return{t:t=>L(`${e}.${t}`,n),et:t=>{let r=`${e}.editor.${t}`,i=L(r,n);if(i!==r)return i;let a=`common.editor.${t}`,o=L(a,n);return o===a?t:o}}}var at=`ptMetro`,ot=`ptTram`,st=`ptBusCity`,ct=`ptBusNight`,lt=`ptTrainS`;function ut(e){switch(e){case at:return`mdi:subway-variant`;case ot:return`mdi:tram`;case st:case ct:return`mdi:bus`;case lt:return`mdi:train`;default:return null}}function dt(e,t){let n={};if(!e||typeof e!=`object`)return n;for(let[r,i]of Object.entries(e))t.has(r)||(n[r]=i);return n}function ft(e,t,n={},r=`var(--primary-color)`){let i=e.toUpperCase();if(t[i]!==void 0)return{background:t[i]};if(/^N\d/.test(i))return{background:Ve,color:He};let a=n[e]??n[i];return a?.bg?a.fg?{background:`#${a.bg}`,color:`#${a.fg}`}:{background:`#${a.bg}`}:{background:r}}function pt(e,t){if(!e)return[];let n=[];for(let[r,i]of Object.entries(e.states??{}))r.startsWith(`sensor.`)&&t(i?.attributes??{})&&n.push(r);return n.sort(),n}var R=`wiener-linien-austria-route-card`,mt=2,ht=/* @__PURE__ */ new Set([`type`,`entity`,`from`,`to`,`title`,`alternatives`,`hide_attribution`,`step_free`,`show_map_pins`,`replan_from_change`]);function z(e){return pt(e,e=>Array.isArray(e.trips)&&typeof e.origin==`string`&&typeof e.destination==`string`&&typeof e.active==`boolean`)}function B(e){if(!e||typeof e!=`object`)throw Error(`${R}: config must be an object`);if(e.entity!==void 0&&typeof e.entity!=`string`)throw Error(`${R}: 'entity' must be a string`);if(typeof e.entity==`string`&&e.entity&&!e.entity.startsWith(`sensor.`))throw Error(`${R}: 'entity' must be a sensor`);let t=gt(e.from,`from`),n=gt(e.to,`to`),r=Number(e.alternatives??mt),i=Number.isFinite(r)?Math.min(3,Math.max(0,Math.round(r))):mt;return{...dt(e,ht),type:e.type,entity:e.entity??``,from:t,to:n,title:typeof e.title==`string`?e.title:``,alternatives:i,hide_attribution:e.hide_attribution===!0,step_free:e.step_free===!0,show_map_pins:e.show_map_pins!==!1,replan_from_change:e.replan_from_change===!0}}function gt(e,t){if(e==null||e===``)return``;let n=(typeof e==`string`||typeof e==`number`?String(e):``).trim();if(!/^\d+$/.test(n))throw Error(`${R}: '${t}' must be a stop number (DIVA)`);return n}function _t(e,t){if(!e)return null;let n=Date.parse(e);return Number.isFinite(n)?Math.max(0,Math.floor((n-t)/6e4)):null}function V(e){return e?/T(\d{2}:\d{2})/.exec(e)?.[1]??``:``}function H(e,t){let n=Array.isArray(e?.trips)?e.trips:[],r=!!e?.planned_for;return n.filter(e=>{if(e.cancelled)return!1;if(r)return!0;let n=e.departure?Date.parse(e.departure):NaN;return!Number.isFinite(n)||n>=t-3e4})}function U(e){let t=e?Date.parse(e):NaN;return Number.isFinite(t)?Pt((/* @__PURE__ */ new Date(Math.round(t/6e4)*6e4)).toISOString()):``}function vt(e,t,n){if(t.risk!==`at_risk`)return null;let r=Date.parse(e.destination.estimated??e.destination.planned??``);if(!Number.isFinite(r))return null;let i=r+t.walk_minutes*6e4;return(n.next_departures??[]).find(e=>Date.parse(e)>=i)??null}function yt(e,t){return e.stop_id&&t.stop_id&&e.stop_id===t.stop_id?!0:typeof e.latitude==`number`&&typeof e.longitude==`number`&&e.latitude===t.latitude&&e.longitude===t.longitude}function W(e){if(!e.planned||!e.estimated)return null;let t=Date.parse(e.planned),n=Date.parse(e.estimated);if(!Number.isFinite(t)||!Number.isFinite(n)||n<=t)return null;let r=U(e.estimated),i=V(e.planned);return r&&r!==i?{planned:i,expected:r}:null}var bt=5;function xt(e){let t=e.headway_minutes??null,n=(e.next_departures??[]).map(V).filter(Boolean);return t!==null&&t<=bt?{every:t}:n.length?{upcoming:n}:t===null?null:{every:t}}function G(e){return[e.line,e.direction,e.origin.stop_id,e.origin.planned].join(`|`)}function St(e){let t=K(e).map(G);return t.length?t.join(`>`):`walk|${e.departure}`}function K(e){return e.legs.filter(e=>!e.walk&&!!e.line)}function Ct(e,t){let n=t===`start`?e.legs:[...e.legs].reverse(),r=[];for(let e of n){if(!e.walk)break;r.push(...e.access??[])}return t===`start`?r:r.reverse()}function wt(e){return[...e.legs.flatMap(e=>e.access??[]),...e.transfers.flatMap(e=>e.access??[])]}var Tt={elevator:`mdi:elevator-passenger`,stairs:`mdi:stairs`,escalator:`mdi:escalator`,ramp:`mdi:slope-uphill`};function Et(e){return e.kind===`ramp`&&e.level===`down`?`mdi:slope-downhill`:Tt[e.kind]??`mdi:walk`}var Dt={elevator:{any:`access_elevator`,up:`access_elevator_up`,down:`access_elevator_down`},stairs:{any:`access_stairs`,up:`access_stairs_up`,down:`access_stairs_down`},escalator:{any:`access_escalator`,up:`access_escalator_up`,down:`access_escalator_down`},ramp:{any:`access_ramp`,up:`access_ramp_up`,down:`access_ramp_down`}};function Ot(e){let t=Dt[e.kind];return t?e.level===`up`?t.up:e.level===`down`?t.down:t.any:null}var kt={ok:`mdi:check-circle-outline`,tight:`mdi:clock-alert-outline`,at_risk:`mdi:alert-circle-outline`};function At(e){return!e?.from||!e.to?``:`${e.from.slice(0,5)}–${e.to.slice(0,5)}`}var jt=[`mon`,`tue`,`wed`,`thu`,`fri`,`sat`,`sun`];function Mt(e,t){let n=(e?.days??[]).filter(e=>jt.includes(e));if(n.length===0||n.length===7)return``;let r=new Intl.DateTimeFormat(t===`en`?`en-GB`:`de-AT`,{weekday:`short`,timeZone:`UTC`}),i=e=>r.format(Date.UTC(2024,0,1+e)),a=jt.map((e,t)=>n.includes(e)?t:-1).filter(e=>e>=0),o=[],s=0;for(;s<a.length;){let e=s;for(;e+1<a.length&&a[e+1]===a[e]+1;)e++;let t=a.slice(s,e+1);t.length>=3?o.push(`${i(t[0])}–${i(t[t.length-1])}`):o.push(...t.map(i)),s=e+1}return o.join(`, `)}function Nt(e,t){if(t&&/^S\d/i.test(t))return`mdi:train`;switch(e){case`ptTrain`:case`ptTrainS`:return`mdi:train`;case`ptBusRegion`:case`ptBusOnDemand`:return`mdi:bus`;case`ptCableCar`:return`mdi:gondola`;case`ptShip`:return`mdi:ferry`;default:return ut(e??void 0)}}function Pt(e){if(!e)return``;let t=Date.parse(e);return Number.isFinite(t)?new Intl.DateTimeFormat(`de-AT`,{hour:`2-digit`,minute:`2-digit`,hourCycle:`h23`,timeZone:`Europe/Vienna`}).format(t):``}var Ft=new Intl.DateTimeFormat(`en-GB`,{year:`numeric`,month:`2-digit`,day:`2-digit`,hour:`2-digit`,minute:`2-digit`,hourCycle:`h23`,timeZone:`Europe/Vienna`});function It(e){let t={};for(let n of Ft.formatToParts(e))t[n.type]=n.value;return t}function Lt(e){let t=3e5,n=It(Math.ceil(e/t)*t);return`${n.year}-${n.month}-${n.day}T${n.hour}:${n.minute}`}function Rt(e){let t=It(e);return`${t.year}-${t.month}-${t.day}T${t.hour}:${t.minute}`}function zt(e,t,n){let r=Date.parse(e.estimated??e.planned??``);return Number.isFinite(r)?Rt(Math.max(r+Math.max(t,0)*6e4,n)):null}function Bt(e){return/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(e)}function Vt(e,t){let n=e?Date.parse(e):NaN;if(!Number.isFinite(n))return null;let r=e=>{let t=It(e);return Date.UTC(Number(t.year),Number(t.month)-1,Number(t.day))};return Math.round((r(n)-r(t))/864e5)}function Ht(e,t){return new Intl.DateTimeFormat(t===`en`?`en-GB`:`de-AT`,{weekday:`short`,day:`2-digit`,month:`2-digit`,timeZone:`Europe/Vienna`}).format(Date.parse(e))}var Ut=12e4,Wt=6e4,Gt=[2e3,3e4];function Kt(){let[e,t]=Gt;return e+Math.random()*(t-e)}function qt(e,t,n=Kt()){let r=e.filter(e=>!e.cancelled&&e.departure).map(e=>Date.parse(e.departure)).find(e=>Number.isFinite(e)&&e+3e4>t);if(r===void 0)return Ut;let i=r+3e4+n-t;return Math.min(Ut,Math.max(Wt,i))}var Jt=6e5;function Yt(e,t){let n=e.planned_for?Jt:qt(e.trips??[],t),r=e.stale?Number(e.retry_after):NaN;return Number.isFinite(r)&&r>0?Math.max(n,r*1e3):n}var Xt=6e4,Zt=6e5,Qt={icon:`mdi:alert-circle-outline`,title:`adhoc_error_unknown`,retry:`countdown`},$t={same_stop:{icon:`mdi:map-marker-alert-outline`,title:`adhoc_error_same_stop`,detail:`adhoc_error_same_stop_detail`,retry:null},rate_limited:{icon:`mdi:timer-sand`,title:`adhoc_error_rate_limited`,retry:`countdown`},not_loaded:{icon:`mdi:power-plug-off-outline`,title:`adhoc_error_not_loaded`,detail:`adhoc_error_not_loaded_detail`,retry:Xt},invalid_stop:{icon:`mdi:map-marker-question-outline`,title:`adhoc_error_invalid_stop`,detail:`adhoc_error_invalid_stop_detail`,retry:null},catalogue_unavailable:{icon:`mdi:cloud-off-outline`,title:`adhoc_error_catalogue`,retry:`countdown`},upstream:{icon:`mdi:cloud-off-outline`,title:`adhoc_error_upstream`,retry:`countdown`}},en={route_too_close:{icon:`mdi:map-marker-distance`,title:`adhoc_error_too_close`,detail:`adhoc_error_too_close_detail`,retry:null},route_stop_invalid:{icon:`mdi:map-marker-question-outline`,title:`adhoc_error_stop_unknown`,detail:`adhoc_error_stop_unknown_detail`,retry:null},route_outside_timetable:{icon:`mdi:calendar-remove-outline`,title:`adhoc_error_no_timetable`,detail:`adhoc_error_no_timetable_detail`,retry:Zt}},tn={icon:`mdi:map-marker-alert-outline`,title:`adhoc_error_refused`,detail:`adhoc_error_refused_detail`,retry:null};function nn(e,t){return e===`invalid_query`?t&&en[t]||tn:$t[e]??Qt}function rn(e,t){return e.retry===`countdown`?Math.max(1,t??60)*1e3:e.retry}var an=`wiener-linien-austria-route-adhoc`;function on(){try{let e=window.localStorage?.getItem(an);if(!e)return null;let t=JSON.parse(e),n=typeof t.from==`string`&&/^\d*$/.test(t.from)?t.from:``,r=typeof t.to==`string`&&/^\d*$/.test(t.to)?t.to:``;return n||r?{from:n,to:r}:null}catch{return null}}function sn(e){try{window.localStorage?.setItem(an,JSON.stringify(e))}catch{}}function q(e){return e.normalize(`NFD`).replace(/\p{Diacritic}/gu,``).replace(/ß/g,`ss`).toLowerCase()}function cn(e){return e.map(e=>q(e.label))}var ln=50;function un(e,t,n=ln,r){let i=q(t).split(/\s+/).filter(Boolean);if(i.length===0)return{matches:e.slice(0,n),total:e.length};let a=i[0],o=[];return e.forEach((e,t)=>{let n=r?.[t]??q(e.label);if(!i.every(e=>n.includes(e)))return;let s=n.startsWith(a)?0:RegExp(`(^|[\\s(\\-/·])${a.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)}`).test(n)?1:2;o.push({stop:e,rank:s,index:t})}),o.sort((e,t)=>e.rank-t.rank||e.index-t.index),{matches:o.slice(0,n).map(e=>e.stop),total:o.length}}function J(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var dn=`/_my_redirect/config_flow_start?domain=wiener_linien_austria`;function fn(e,t,n){return[{name:`entity`,selector:{entity:{include_entities:e}}},{name:`title`,selector:{text:{}}},...t&&n?[{name:`from`,selector:n},{name:`to`,selector:n}]:[],{name:`alternatives`,selector:{number:{min:0,max:3,step:1,mode:`slider`}}},...t&&n?[{name:`step_free`,selector:{boolean:{}}},{name:`replan_from_change`,selector:{boolean:{}}}]:[],{name:`show_map_pins`,selector:{boolean:{}}},{name:`hide_attribution`,selector:{boolean:{}}}]}var Y=class extends P{constructor(...e){super(...e),this._stopSelector=null,this._stopsRequested=!1,this._computeLabel=e=>nt(this.hass,this._i18n,e.name),this._computeHelper=e=>rt(this._i18n,e.name),this._onValueChanged=e=>{if(!this._config)return;let t=e.detail.value,n={...this._config,...t};n.entity||delete n.entity,(n.entity||!n.from)&&delete n.from,(n.entity||!n.to)&&delete n.to,n.title||delete n.title,(n.entity||n.step_free!==!0)&&delete n.step_free,n.show_map_pins!==!1&&delete n.show_map_pins,(n.entity||n.replan_from_change!==!0)&&delete n.replan_from_change,n.hide_attribution!==!0&&delete n.hide_attribution,this._config=B(n),We(this,`config-changed`,{config:n})}}setConfig(e){this._config=B(e)}get _i18n(){return it(`route`,this.hass?.language)}updated(){!this._stopsRequested&&this._config&&!this._config.entity&&this.hass?.callWS&&(this._stopsRequested=!0,this.hass.callWS({type:`wiener_linien_austria/stops`}).then(e=>{let t=Array.isArray(e?.stops)?e.stops:[];this._stopSelector={select:{mode:`dropdown`,sort:!1,options:t}}}).catch(e=>{console.warn(`[${R}-editor] stop list unavailable`,e)}))}render(){if(!this._config)return k;let e=z(this.hass),{et:t}=this._i18n;return D`
      ${e.length===0?D`<ha-alert alert-type="info">
            ${t(`no_routes`)}
            <a slot="action" href=${dn}>${t(`add_route`)}</a>
          </ha-alert>`:k}
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${fn(e,!this._config.entity,this._stopSelector)}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._onValueChanged}
      ></ha-form>
    `}};J([F({attribute:!1})],Y.prototype,`hass`,void 0),J([I()],Y.prototype,`_config`,void 0),J([I()],Y.prototype,`_stopSelector`,void 0),Y=J([je(`${R}-editor`)],Y);async function pn(e,t,n){if(!e?.callWS)return null;try{let r=await e.callWS({type:t});if(r?.version&&r.version!==n)return r.version}catch{}return null}function mn(e){if(e)try{window.sessionStorage?.setItem(`wl-reload-attempted-${e}`,`1`)}catch{}let t=(async()=>{let e=await window.caches?.keys?.()??[];await Promise.all(e.map(e=>window.caches?.delete?.(e)))})().catch(()=>{}),n=new Promise(e=>{setTimeout(e,1e3)});Promise.race([t,n]).then(()=>window.location.reload())}function hn(e){if(!e)return!1;try{return window.sessionStorage?.getItem(`wl-reload-attempted-${e}`)===`1`}catch{return!1}}function gn(e,t,n=`banner`){if(!e)return k;if(hn(e))return D`
      <div class=${n} role="alert" aria-live="assertive">
        <span>${t(`version_reload_stuck`)}</span>
      </div>
    `;let r=t(`version_update`).replace(`{v}`,e),i=t(`version_reload`);return D`
    <div class=${n} role="alert" aria-live="assertive">
      <span>${r}</span>
      <button
        type="button"
        aria-label=${i}
        @click=${()=>mn(e)}
      >
        ${i}
      </button>
    </div>
  `}var _n=`wiener-linien-austria-stop-combobox`,vn=500,X=class extends P{constructor(...e){super(...e),this.stops=[],this.value=``,this.idBase=`stop`,this.strings={label:``,toggle:``,noMatch:``,noResults:``,count:()=>``},this._text=``,this._open=!1,this._active=-1,this._invalid=!1,this._filtering=!1,this._status=``,this._labelByValue=/* @__PURE__ */ new Map,this._folded=[],this._statusTimer=null,this._onInput=e=>{this._text=e.target.value,this._filtering=!0,this._invalid=!1,this._open=!0,this._active=-1,this._scheduleStatus()},this._onKeyDown=e=>{let{matches:t}=this._results;switch(e.key){case`ArrowDown`:if(e.preventDefault(),!this._open){this._open=!0,e.altKey||(this._active=t.length?0:-1);return}this._active=Math.min(this._active+1,t.length-1);return;case`ArrowUp`:if(e.preventDefault(),!this._open){this._open=!0,this._active=t.length-1;return}this._active=t.length?Math.max(this._active-1,0):-1;return;case`Enter`:{if(!this._open)return;e.preventDefault();let n=t[this._active>=0?this._active:0];n&&this._pick(n);return}case`Escape`:this._open?(e.preventDefault(),this._open=!1,this._active=-1,this._clearStatus()):(this._filtering||this._invalid)&&(e.preventDefault(),this._revert())}},this._onBlur=()=>{if(this._open=!1,this._active=-1,this._clearStatus(),!this._filtering)return;let e=q(this._text.trim());if(!e){this._pick(null);return}let t=this.stops[this._folded.indexOf(e)];t?this._pick(t):this._invalid=!0},this._toggle=()=>{this._open=!this._open,this._active=-1,this._clearStatus(),this._open&&(this._filtering=!1),this._input?.focus()}}createRenderRoot(){return this}disconnectedCallback(){super.disconnectedCallback(),this._clearStatus()}willUpdate(e){e.has(`stops`)&&(this._labelByValue=new Map(this.stops.map(e=>[e.value,e.label])),this._folded=cn(this.stops)),(e.has(`value`)||e.has(`stops`))&&!this._hasFocus()&&this._revert()}updated(){this._open&&this._active>=0&&this.querySelector(`#${this.idBase}-option-${this._active}`)?.scrollIntoView?.({block:`nearest`})}get _results(){return un(this.stops,this._filtering?this._text:``,void 0,this._folded)}_hasFocus(){let e=this._input,t=this.getRootNode();return!!e&&t.activeElement===e}get _input(){return this.querySelector(`input`)}_pick(e){let t=e?.value??``;this._text=e?.label??``,this._filtering=!1,this._invalid=!1,this._open=!1,this._active=-1,this._clearStatus(),t!==this.value&&this.dispatchEvent(new CustomEvent(`stop-picked`,{detail:{value:t}}))}_scheduleStatus(){this._statusTimer!==null&&clearTimeout(this._statusTimer),this._statusTimer=setTimeout(()=>{if(this._statusTimer=null,!this._open||!this._filtering)return;let{matches:e,total:t}=this._results;this._status=this.strings.count(e.length,t)},vn)}_clearStatus(){this._statusTimer!==null&&clearTimeout(this._statusTimer),this._statusTimer=null,this._status=``}_revert(){this._text=this._labelByValue.get(this.value)??``,this._filtering=!1,this._invalid=!1}render(){let e=this.idBase,{matches:t,total:n}=this._results,r=`${e}-list`,i=this._open&&this._active>=0?`${e}-option-${this._active}`:``,a=this._invalid?`${e}-error`:k,o=this._filtering&&this._active<0?0:-1;return D`
      <label class="combo-label" for=${`${e}-input`}>${this.strings.label}</label>
      <div class="combo-field" ?data-open=${this._open}>
        <input
          id=${`${e}-input`}
          type="text"
          role="combobox"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          aria-autocomplete="list"
          aria-expanded=${this._open?`true`:`false`}
          aria-controls=${r}
          aria-activedescendant=${i||k}
          aria-invalid=${this._invalid?`true`:`false`}
          aria-describedby=${a}
          .value=${this._text}
          @input=${this._onInput}
          @keydown=${this._onKeyDown}
          @blur=${this._onBlur}
          @focus=${e=>e.target.select()}
        />
        <button
          type="button"
          class="combo-toggle"
          tabindex="-1"
          aria-label=${this.strings.toggle}
          aria-controls=${r}
          aria-expanded=${this._open?`true`:`false`}
          @pointerdown=${e=>e.preventDefault()}
          @click=${this._toggle}
        >
          <ha-icon
            icon=${this._open?`mdi:chevron-up`:`mdi:chevron-down`}
            aria-hidden="true"
          ></ha-icon>
        </button>
      </div>
      <ul
        class="combo-list"
        id=${r}
        role="listbox"
        aria-label=${this.strings.label}
        ?hidden=${!this._open}
      >
        ${this._open?t.map((t,n)=>D`<li
                id=${`${e}-option-${n}`}
                role="option"
                class="combo-option"
                aria-selected=${n===this._active?`true`:`false`}
                ?data-current=${t.value===this.value}
                ?data-enter=${n===o}
                @pointerdown=${e=>e.preventDefault()}
                @click=${()=>this._pick(t)}
              >
                ${t.label}
              </li>`):k}
      </ul>
      ${this._open&&n===0?D`<p class="combo-note">${this.strings.noResults}</p>`:k}
      ${this._open&&n>t.length?D`<p class="combo-note" aria-hidden="true">${this.strings.count(t.length,n)}</p>`:k}
      <span class="sr-only" role="status">${this._open?this._status:``}</span>
      ${this._invalid?D`<p class="field-error" id=${`${e}-error`}>${this.strings.noMatch}</p>`:k}
    `}};J([F({attribute:!1})],X.prototype,`stops`,void 0),J([F({attribute:!1})],X.prototype,`value`,void 0),J([F({attribute:!1})],X.prototype,`idBase`,void 0),J([F({attribute:!1})],X.prototype,`strings`,void 0),J([I()],X.prototype,`_text`,void 0),J([I()],X.prototype,`_open`,void 0),J([I()],X.prototype,`_active`,void 0),J([I()],X.prototype,`_invalid`,void 0),J([I()],X.prototype,`_filtering`,void 0),J([I()],X.prototype,`_status`,void 0),X=J([je(_n)],X);function yn(e){return e.replace(/[^A-Za-z0-9_]/g,`_`)}function bn(e,t,n){let r=null;return typeof t==`number`&&typeof n==`number`?r=`https://stadtplan.wien.gv.at/#/@${n},${t},17.5,0,0,standard/themes`:e&&(r=`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${e}, Wien`)}`),r&&Ue(r)||null}var xn=15e3,Sn=2;function Cn(e){let t=e,n=Number(t?.translation_placeholders?.retry_after);return{code:typeof t?.code==`string`?t.code:`unknown`,retryAfter:Number.isFinite(n)?n:null,translationKey:t?.translation_key??null,retryAt:null}}function Z(e,t){return e==null||e<=t?0:Math.ceil((e-t)/1e3)}function wn(e,t,n){return t.retry===`countdown`&&n!==null?{...e,retryAt:Date.now()+n}:e}var Q=e=>typeof e==`number`&&Number.isInteger(e)&&e>=0,Tn=[`now`,`depart`,`arrive`];{let e=window;e.customCards=e.customCards??[],e.customCards.some(e=>e.type===`wiener-linien-austria-route-card`)||e.customCards.push({type:R,name:`Wiener Linien Austria — Route`,description:tt(`picker_route`),preview:!0,getEntitySuggestion:(e,t)=>!t.startsWith(`sensor.`)||e?.entities?.[t]?.platform!==`wiener_linien_austria`||!z(e).includes(t)?null:{config:{type:`custom:${R}`,entity:t}}})}var $=class extends P{constructor(...e){super(...e),this.preview=!1,this._versionMismatch=null,this._now=Date.now(),this._alternativesOpen=!1,this._openRides=/* @__PURE__ */ new Set,this._openAlternatives=/* @__PURE__ */ new Set,this._stops=null,this._stopsError=null,this._from=``,this._to=``,this._timeMode=`now`,this._when=``,this._plan=null,this._replanFrom=null,this._phase=`idle`,this._error=null,this._announcement=``,this._requestsLeft=null,this._requestsNextAt=null,this._requestsMax=null,this._requestsRefillS=null,this._answeredAt=/* @__PURE__ */ new Map,this._secondNow=Date.now(),this._countdownTimer=null,this._tipHideTimer=null,this._tick=null,this._versionCheckDone=!1,this._adhocStarted=!1,this._planKey=``,this._planSeq=0,this._revealAlternatives=!1,this._pageHistory=[],this._refreshTimer=null,this._nextRefreshAt=null,this._comboStringsCache=/* @__PURE__ */ new Map,this._debounceTimer=null,this._stopsRetryTimer=null,this._stopsLoading=!1,this._pendingRefresh=!1,this._onScreen=!0,this._lastInteraction=Date.now(),this._observer=null,this._onVisibilityChange=()=>{this._catchUp()},this._onCardActivity=()=>{this._isAdhoc&&(this._lastInteraction=Date.now(),this._phase===`paused`&&this._runPlan(!0))},this._onWhen=e=>{let t=e.target.value;Bt(t)&&t!==this._when&&(this._when=t,this._pageHistory=[],this._lastInteraction=Date.now(),this._requestPlan(!0))},this._swap=()=>{[this._from,this._to]=[this._to,this._from],this._replanFrom=null,this._revealAlternatives=!1,this._pageHistory=[],sn({from:this._from,to:this._to}),this._lastInteraction=Date.now(),this._requestPlan(!0)},this._backToOrigin=()=>{let e=this._replanFrom;e&&(this._replanFrom=null,this._revealAlternatives=!1,this._pageHistory=[],this._from=e.from,this._timeMode=e.timeMode,this._when=e.when,this._lastInteraction=Date.now(),this._requestPlan(!0))},this._later=()=>{let e=this._laterStep();e&&!this._sayWait(e)&&(this._pageHistory=[...this._pageHistory,{timeMode:this._timeMode,when:this._when}],this._step(e.timeMode,e.when))},this._earlier=()=>{let e=this._earlierStep();e&&!this._sayWait(e)&&(e===this._pageHistory.at(-1)&&(this._pageHistory=this._pageHistory.slice(0,-1)),this._step(e.timeMode,e.when))},this._onTipEnter=e=>{if(e.pointerType!==`mouse`)return;this._tipHideTimer!==null&&clearTimeout(this._tipHideTimer),this._tipHideTimer=null;let t=this._tipBubble();typeof t?.showPopover==`function`&&!this._tipShown(t)&&t.showPopover()},this._onTipLeave=e=>{e.pointerType===`mouse`&&(this._tipHideTimer!==null&&clearTimeout(this._tipHideTimer),this._tipHideTimer=setTimeout(()=>{this._tipHideTimer=null;let e=this._tipBubble();typeof e?.hidePopover==`function`&&this._tipShown(e)&&e.hidePopover()},200))},this._onTipClick=e=>{e.pointerType===`mouse`&&this._tipShown(this._tipBubble())&&e.preventDefault()}}setConfig(e){let t=this._config;if(this._config=B(e),this._config.entity){this._stopAdhoc();return}let n=this._config;this._adhocStarted&&t&&(t.from!==n.from||t.to!==n.to||t.step_free!==n.step_free)&&(n.from&&(this._from=n.from),n.to&&(this._to=n.to),this._pageHistory=[],this._requestPlan(!1)),this._startAdhoc()}get _isAdhoc(){return!!this._config&&!this._config.entity}getCardSize(){return 11}get _fixedHeight(){return Ge(this.layout,this._config,void 0)}getGridOptions(){return{columns:6,min_columns:4,min_rows:3}}static getConfigElement(){return document.createElement(`${R}-editor`)}static getStubConfig(e){let t=z(e)[0];return t?{entity:t}:{}}connectedCallback(){super.connectedCallback(),Ye(),this._now=Date.now(),this._tick=setInterval(()=>{this._now=Date.now()},xn),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion()),this._lastInteraction=Date.now(),document.addEventListener(`visibilitychange`,this._onVisibilityChange),this._startAdhoc(),this._syncCountdown()}disconnectedCallback(){super.disconnectedCallback(),this._tick!==null&&clearInterval(this._tick),this._tick=null,document.removeEventListener(`visibilitychange`,this._onVisibilityChange),this._stopAdhoc(),this._countdownTimer!==null&&clearTimeout(this._countdownTimer),this._countdownTimer=null,this._tipHideTimer!==null&&clearTimeout(this._tipHideTimer),this._tipHideTimer=null}updated(e){e.has(`hass`)&&!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion()),e.has(`hass`)&&this._startAdhoc()}shouldUpdate(e){if(!this._config)return!1;let t=this._config.entity;return Ke(e,this.hass,()=>t?[t]:[])}_startAdhoc(){if(this._adhocStarted||!this._isAdhoc||!this.isConnected||!this.hass?.callWS)return;this._adhocStarted=!0;let e=this._config;if(!this._from&&!this._to){let t=on();this._from=t?.from||e.from,this._to=t?.to||e.to}if(this._loadStops(),typeof IntersectionObserver<`u`&&(this._observer=new IntersectionObserver(e=>{this._onScreen=e.some(e=>e.isIntersecting),this._catchUp()}),this._observer.observe(this)),this._from&&this._to){if(this._plan&&this._planKey===this._queryKey()){let e=this._nextRefreshAt===null?0:this._nextRefreshAt-Date.now();e>0?this._schedule(e):(this._pendingRefresh=!0,this._catchUp())}else this._runPlan(!1)}}_stopAdhoc(){this._adhocStarted=!1;for(let e of[this._refreshTimer,this._debounceTimer,this._stopsRetryTimer])e!==null&&clearTimeout(e);this._refreshTimer=this._debounceTimer=this._stopsRetryTimer=null,this._observer?.disconnect(),this._observer=null}_canRefresh(){return this.isConnected&&this._onScreen&&document.visibilityState!==`hidden`}_catchUp(){this._pendingRefresh&&this._canRefresh()&&(this._pendingRefresh=!1,this._refreshDue())}_refreshDue(){this._canRefresh()?Date.now()-this._lastInteraction>18e5?this._phase=`paused`:this._runPlan(!1):this._pendingRefresh=!0}_schedule(e){this._refreshTimer!==null&&clearTimeout(this._refreshTimer),this._refreshTimer=null,this._nextRefreshAt=Date.now()+e,this._adhocStarted&&(this._refreshTimer=setTimeout(()=>{this._refreshTimer=null,this._refreshDue()},e))}_requestPlan(e){this._debounceTimer!==null&&clearTimeout(this._debounceTimer),this._debounceTimer=setTimeout(()=>{this._debounceTimer=null,this._runPlan(e)},400)}async _loadStops(){if(!(this._stops||this._stopsLoading||!this.hass?.callWS)){this._stopsLoading=!0;try{let e=await this.hass.callWS({type:`wiener_linien_austria/stops`}),t=Array.isArray(e?.stops)?e.stops:[];this._stops=t,this._stopsError=null}catch(e){let t=Cn(e),n=nn(t.code),r=rn(n,t.retryAfter);this._stopsError=wn(t,n,r),this._syncCountdown(),r!==null&&this._adhocStarted&&(this._stopsRetryTimer=setTimeout(()=>{this._stopsRetryTimer=null,this._loadStops()},r))}finally{this._stopsLoading=!1}}}async _runPlan(e){this._refreshTimer!==null&&clearTimeout(this._refreshTimer),this._refreshTimer=null,this._nextRefreshAt=null,this._pendingRefresh=!1;let{_from:t,_to:n}=this,r=++this._planSeq;if(!this._canPlan(t,n,e)||!this.hass?.callWS)return;let i=this._queryKey();this._planKey!==i&&(this._plan=null,this._alternativesOpen=!1,this._openAlternatives=/* @__PURE__ */ new Set),this._plan||(this._phase=`loading`);try{let a=await this.hass.callWS(this._planRequest(t,n));r===this._planSeq&&this._applyPlan(a,i,e)}catch(t){r===this._planSeq&&this._applyPlanError(t,e)}}_canPlan(e,t,n){return e&&t&&e!==t?!0:(this._plan=null,this._planKey=``,!e||!t?(this._error=null,this._phase=`idle`,!1):(this._error={code:`same_stop`,retryAfter:null,translationKey:null,retryAt:null},this._phase=`error`,n&&this._announce(this._adhocError(this._error).title),!1))}_planRequest(e,t){let n=this._timeMode!==`now`&&Bt(this._when);return{type:`wiener_linien_austria/plan`,origin:Number(e),destination:Number(t),...n?{datetime:this._when,arrive_by:this._timeMode===`arrive`}:{},...this._config?.step_free?{step_free:!0}:{}}}_applyPlan(e,t,n){this._plan=e,this._planKey=t,this._error=null,this._phase=`ready`,this._revealAlternatives&&=(this._alternativesOpen=!0,!1);let r=Date.parse(e.fetched_at??``);if(this._rememberAnswer(t,Number.isFinite(r)?Math.min(Date.now(),r):Date.now()),this._noteBudget(e),n){let t=this._planAnnouncement(e),n=this._budgetNote();this._announce(n?`${t}. ${n}.`:t)}this._schedule(Yt(e,Date.now()))}_noteBudget(e){let t=e.requests_left,n=e.requests_next_in;this._requestsLeft=Q(t)?t:null,this._requestsNextAt=Q(t)&&typeof n==`number`&&n>0?Date.now()+n*1e3:null,Q(e.requests_max)&&(this._requestsMax=e.requests_max),Q(e.requests_refill_s)&&(this._requestsRefillS=e.requests_refill_s),this._syncCountdown()}_rememberAnswer(e,t){let n=Date.now();for(let[e,t]of this._answeredAt)n-t>=27e4&&this._answeredAt.delete(e);this._answeredAt.set(e,t)}_applyPlanError(e,t){let n=Cn(e),r=nn(n.code,n.translationKey),i=rn(r,n.retryAfter);this._error=wn(n,r,i),this._revealAlternatives=!1,this._plan=null,this._planKey=``,this._phase=`error`,t&&this._announce(this._adhocError(n).title),i!==null&&this._schedule(i),n.code===`rate_limited`?this._noteBudget({requests_left:0,requests_next_in:(i??6e4)/1e3}):this._syncCountdown()}_onPick(e,t){let n=typeof t==`string`||typeof t==`number`?String(t):``;e===`from`?this._from=n:this._to=n,this._replanFrom=null,this._revealAlternatives=!1,this._pageHistory=[],sn({from:this._from,to:this._to}),this._lastInteraction=Date.now(),this._requestPlan(!0)}_queryKey(e={timeMode:this._timeMode,when:this._when}){let t=e.timeMode===`now`?`now`:`${e.timeMode}@${e.when}`;return`${this._from}>${this._to}|${t}|${this._config?.step_free?`step-free`:``}`}_onTimeMode(e){e!==this._timeMode&&(e!==`now`&&!Bt(this._when)&&(this._when=Lt(Date.now())),this._timeMode=e,this._pageHistory=[],this._lastInteraction=Date.now(),this._requestPlan(!0))}_canReplanFrom(e){let t=this._config;if(!this._isAdhoc||!this._to||!t?.replan_from_change||!t.alternatives)return!1;let n=e.stop_id;return!n||n===this._to?!1:this._stops?.some(e=>e.value===n)===!0}_originName(){return(this._plan?H(this._plan,this._now)[0]:void 0)?.legs[0]?.origin.name??``}_replanFromHere(e,t){let n=e.stop_id;n&&(this._replanFrom??={from:this._from,timeMode:this._timeMode,when:this._when,name:this._originName()},this._from=n,this._revealAlternatives=!0,this._pageHistory=[],this._timeMode=`depart`,this._when=t,this._lastInteraction=Date.now(),this._announce(this._t(`replan_announce`,{stop:e.name})),this._requestPlan(!0))}_answered(){return!!this._plan&&this._planKey===this._queryKey()}_pageBase(){return this._answered()?H(this._plan,this._now)[0]:void 0}_canGoEarlier(){return this._answered()?this._pageHistory.length>0||!!this._pageBase()&&this._timeMode!==`now`:!1}_laterStep(){let e=this._pageBase(),t=Date.parse(e?.legs[0]?.origin.planned??e?.departure??``);return Number.isFinite(t)?{timeMode:`depart`,when:Rt(t+6e4)}:null}_earlierStep(){if(!this._canGoEarlier())return null;let e=this._pageHistory.at(-1);if(e)return e;let t=this._pageBase(),n=Math.min(...[t.legs.at(-1)?.destination.planned,t.arrival].map(e=>Date.parse(e??``)).filter(Number.isFinite));return Number.isFinite(n)?{timeMode:`arrive`,when:Rt(n-6e4)}:null}_mustWait(e,t=this._secondNow){if(this._pagerWait(t)===0)return!1;let n=this._answeredAt.get(this._queryKey(e));return n===void 0||t-n>=27e4}_step(e,t){this._timeMode=e,this._when=t,this._lastInteraction=Date.now(),this._debounceTimer!==null&&clearTimeout(this._debounceTimer),this._debounceTimer=null,this._runPlan(!0)}_pagerWait(e=this._secondNow){return this._requestsLeft===0?Z(this._requestsNextAt,e):0}_budgetNote(){let e=this._pagerWait();if(e>0)return this._t(`page_wait`,{s:e});let t=this._requestsLeft;if(!t||t>2)return``;let n=t===1?this._t(`page_requests_left_one`):this._t(`page_requests_left`,{n:t}),r=Z(this._requestsNextAt,this._secondNow);return r>0?`${n}, ${this._t(`page_refill_in`,{s:r})}`:n}_budgetWhy(){let e=this._requestsMax,t=this._requestsRefillS;if(!e||!t||(this._phase!==`error`||this._error?.code!==`rate_limited`)&&(this._phase===`error`||!this._budgetNote()))return``;let n=t===60?this._t(`page_every_minute`):this._t(`page_every_seconds`,{s:t});return this._t(`page_why`,{max:e,every:n})}_sayWait(e){let t=Date.now();if(!this._mustWait(e,t))return!1;let n=this._pagerWait(t);return this._announce(`${this._t(`adhoc_error_rate_limited`)}. ${this._t(`page_wait`,{s:n})}.`),!0}_syncCountdown(){this._countdownTimer!==null&&clearTimeout(this._countdownTimer),this._countdownTimer=null;let e=Date.now();for(this._secondNow=e;this._requestsNextAt!==null&&this._requestsNextAt<=e;){let e=(this._requestsLeft??0)+1;this._requestsLeft=e,this._requestsNextAt=this._requestsRefillS&&this._requestsMax&&e<this._requestsMax?this._requestsNextAt+this._requestsRefillS*1e3:null}this.isConnected&&(this._requestsNextAt!==null&&this._requestsLeft!==null&&this._requestsLeft<=2||Z(this._error?.retryAt,e)>0||Z(this._stopsError?.retryAt,e)>0)&&(this._countdownTimer=setTimeout(()=>{this._countdownTimer=null,this._syncCountdown()},1e3))}_announce(e){this._announcement=e===this._announcement?`${e} `:e}_planAnnouncement(e){let t=H(e,Date.now())[0];if(!t)return this._t(`adhoc_no_trips`);let n=this._tripSummary(t);if(e.planned_for)return this._t(`adhoc_announce_planned`,{day:this._dayText(t.departure),time:V(t.departure),summary:n});let r=_t(t.departure,Date.now());return r===0?this._t(`adhoc_announce_now`,{summary:n}):this._t(`adhoc_announce`,{n:r??0,summary:n})}_adhocError(e){let t=nn(e.code,e.translationKey),n=t.retry===`countdown`?this._t(`adhoc_error_retry_detail`,{s:e.retryAt===null?e.retryAfter??60:Math.max(1,Z(e.retryAt,this._secondNow))}):t.detail&&this._t(t.detail);return{icon:t.icon,title:this._t(t.title),...n?{detail:n}:{}}}async _checkCardVersion(){this._versionMismatch=await pn(this.hass,`wiener_linien_austria/route_card_version`,Be)}_t(e,t){return L(`route.${e}`,{hassLanguage:this.hass?.language},t)}_dayText(e){let t=Vt(e,this._now);return t===0?this._t(`day_today`):t===1?this._t(`day_tomorrow`):e?Ht(e,this._lang):``}get _lang(){return(this.hass?.language??`de`).startsWith(`en`)?`en`:`de`}render(){let e=this._config;if(!e)return k;let t=!e.entity,n=e.entity?this.hass?.states[e.entity]:void 0,r=(t?this._plan:n?.attributes)??{},i=e.title||(t?this._t(`adhoc_heading`):r.origin&&r.destination?`${r.origin} → ${r.destination}`:this._t(`heading_fallback`)),a=e.hide_attribution?``:typeof r.attribution==`string`&&r.attribution||`Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0`;return D`
      <ha-card
        class=${this._fixedHeight?`fixed-height`:``}
        @pointerdown=${this._onCardActivity}
        @keydown=${this._onCardActivity}
      >
        <div class="wrap">
          ${gn(this.preview?null:this._versionMismatch,e=>this._t(e))}
          <div class="header">
            <h2 class="heading">
              <ha-icon icon="mdi:map-marker-path" aria-hidden="true"></ha-icon>
              <span>${i}</span>
            </h2>
            ${this._renderUpdated(r.fetched_at)}
          </div>
          ${t?D`
                ${this._renderPickers()} ${this._renderTimeControl()} ${this._renderPager()}
                <p class="sr-only" role="status" aria-live="polite">${this._announcement}</p>
                <div class="results" aria-busy=${this._phase===`loading`?`true`:`false`}>
                  ${this._renderAdhocBody(e)}
                </div>
              `:this._renderBody(e,n?.state,r)}
          ${a?D`<div class="attribution">${a}</div>`:k}
        </div>
      </ha-card>
    `}_renderUpdated(e){let t=Pt(e);return!t||!e?k:D`<p class="updated">
      <ha-icon icon="mdi:update" aria-hidden="true"></ha-icon>
      <time datetime=${e}>${this._t(`updated`,{time:t})}</time>
    </p>`}_renderPickers(){return this._stops===null?this._stopsError?D``:D`<p class="picker-status">${this._t(`adhoc_stops_loading`)}</p>`:D`
      <fieldset class="pickers">
        <legend class="sr-only">${this._t(`adhoc_legend`)}</legend>
        ${this._renderPicker(`from`,this._t(`adhoc_from`))}
        <button
          type="button"
          class="swap"
          aria-label=${this._t(`adhoc_swap`)}
          title=${this._t(`adhoc_swap`)}
          ?disabled=${!this._from&&!this._to}
          @click=${this._swap}
        >
          <ha-icon icon="mdi:swap-vertical" aria-hidden="true"></ha-icon>
        </button>
        ${this._renderPicker(`to`,this._t(`adhoc_to`))}
      </fieldset>
    `}_renderTimeControl(){if(this._stops===null)return k;let e={now:this._t(`when_now`),depart:this._t(`when_depart`),arrive:this._t(`when_arrive`)};return D`
      <fieldset class="when">
        <legend class="sr-only">${this._t(`when_legend`)}</legend>
        <div class="when-modes">
          ${Tn.map(t=>D`<label class="when-mode">
              <input
                type="radio"
                name="wl-adhoc-when"
                .checked=${this._timeMode===t}
                @change=${()=>this._onTimeMode(t)}
              />
              <span>${e[t]}</span>
            </label>`)}
        </div>
        ${this._timeMode===`now`?k:D`<label class="when-field">
              <span class="sr-only">${this._t(`when_input`)}</span>
              <input type="datetime-local" .value=${this._when} @change=${this._onWhen} />
            </label>`}
      </fieldset>
    `}_renderPager(){if(this._stops===null||!this._from||!this._to||this._from===this._to)return k;let e=this._pagerWait()>0,t=this._laterStep(),n=this._earlierStep(),r=!t||this._mustWait(t),i=!n||this._mustWait(n),a=this._phase===`error`?``:this._budgetNote(),o=this._budgetWhy(),s=[a&&`wl-pager-note`,o&&`wl-pager-why`].filter(Boolean).join(` `)||k;return D`<div class="pager" role="group" aria-label=${this._t(`page_legend`)}>
      <button
        type="button"
        class="page page--earlier"
        aria-disabled=${i?`true`:k}
        aria-describedby=${s}
        @click=${this._earlier}
      >
        <ha-icon icon="mdi:chevron-left" aria-hidden="true"></ha-icon>
        <span>${this._t(`page_earlier`)}</span>
      </button>
      ${a||o?D`<div class="pager-note">
            ${e?D`<ha-icon icon="mdi:timer-sand" aria-hidden="true"></ha-icon>`:k}
            ${a?D`<span id="wl-pager-note">${a}</span>`:k}
            ${o?this._renderWhy(o):k}
          </div>`:k}
      <button
        type="button"
        class="page page--later"
        aria-disabled=${r?`true`:k}
        aria-describedby=${s}
        @click=${this._later}
      >
        <span>${this._t(`page_later`)}</span>
        <ha-icon icon="mdi:chevron-right" aria-hidden="true"></ha-icon>
      </button>
    </div>`}_renderWhy(e){return D`<span
      class="tip"
      @pointerenter=${this._onTipEnter}
      @pointerleave=${this._onTipLeave}
    >
      <button
        type="button"
        class="tip-button"
        popovertarget="wl-pager-why"
        aria-label=${this._t(`page_why_label`)}
        @click=${this._onTipClick}
      >
        <ha-icon icon="mdi:information-outline" aria-hidden="true"></ha-icon>
      </button>
      <span class="tip-bubble" id="wl-pager-why" popover="auto">${e}</span>
    </span>`}_tipBubble(){return this.renderRoot.querySelector(`#wl-pager-why`)}_tipShown(e){try{return!!e?.matches(`:popover-open`)}catch{return!1}}_comboStrings(e){let t=`${this.hass?.language??``}|${e}`,n=this._comboStringsCache.get(t);return n||(n={label:e,toggle:this._t(`adhoc_show_stops`),noMatch:this._t(`adhoc_no_match`),noResults:this._t(`adhoc_no_results`),count:(e,t)=>e<t?this._t(`adhoc_matches_more`,{shown:e,total:t}):this._t(`adhoc_matches`,{n:t})},this._comboStringsCache.set(t,n)),n}_renderPicker(e,t){return D`<wiener-linien-austria-stop-combobox
      class=${`picker picker--${e}`}
      .stops=${this._stops??[]}
      .value=${e===`from`?this._from:this._to}
      .idBase=${`wl-adhoc-${e}`}
      .strings=${this._comboStrings(t)}
      @stop-picked=${t=>this._onPick(e,t.detail.value)}
    ></wiener-linien-austria-stop-combobox>`}_renderAdhocBody(e){if(this._stopsError){let{icon:e,title:t,detail:n}=this._adhocError(this._stopsError);return this._empty(e,t,n,!1)}if(this._stops===null)return D``;if(!this._from||!this._to)return this._empty(`mdi:map-search-outline`,this._t(`adhoc_pick`),this._t(`adhoc_pick_detail`),!1);let t=this._renderReplanBack();if(this._phase===`error`&&this._error){let{icon:e,title:n,detail:r}=this._adhocError(this._error);return D`${t}${this._empty(e,n,r,!1)}`}let n=this._phase===`paused`?D`<div class="paused">
            <ha-icon icon="mdi:pause-circle-outline" aria-hidden="true"></ha-icon>
            <span>${this._t(`adhoc_paused`)}</span>
            <button type="button" @click=${this._onCardActivity}>${this._t(`adhoc_resume`)}</button>
          </div>`:k,r=this._plan;if(!r)return this._phase===`paused`?D`${t}${n}`:D`${t}${this._empty(`mdi:timer-sand`,this._t(`adhoc_loading`),void 0,!1)}`;let i=r.stale&&this._phase!==`paused`?D`<p class="stale-note">
            <ha-icon icon="mdi:timer-sand" aria-hidden="true"></ha-icon>
            <span>${this._t(`adhoc_stale`)}</span>
          </p>`:k,a=H(r,this._now);return a[0]?D`${t}${n}${i}${this._renderTrips(a,r,e)}`:D`${t}${n}${i}${this._empty(`mdi:timetable`,this._t(`adhoc_no_trips`),this._t(`adhoc_no_trips_detail`),!1)}`}_renderBody(e,t,n){if(t===void 0)return D`<ha-alert alert-type="warning"
        >${this._t(`entity_missing`,{entity:e.entity})}</ha-alert
      >`;if(!z(this.hass).includes(e.entity)&&t!==`unavailable`)return this._empty(`mdi:swap-horizontal`,this._t(`not_a_route`));if(t===`unavailable`)return this._empty(`mdi:cloud-off-outline`,this._t(`unavailable`),this._t(`unavailable_detail`));if(n.active===!1){let e=[Mt(n.active_window,this._lang),At(n.active_window)].filter(Boolean).join(` `);return this._empty(`mdi:sleep`,this._t(`inactive`),e?this._t(`inactive_detail`,{when:e}):void 0)}let r=H(n,this._now);return r[0]?this._renderTrips(r,n,e):this._empty(`mdi:timetable`,this._t(`no_trips`),this._t(`no_trips_detail`))}_renderTrips(e,t,n){let r=e[0],i=e.slice(1,1+n.alternatives);return D`
      ${this._renderHero(r,t)}
      ${this._renderNotices(r,t)}
      ${this._renderStrand(r,t)}
      ${i.length?this._renderAlternatives(i,t):k}
      ${this._renderLastConnection(t)}
    `}_renderLastConnection(e){let t=e.last_connection;return!t||!H({trips:[t]},this._now).length?k:D`
      <p class="last-connection">
        <ha-icon icon="mdi:weather-night" aria-hidden="true"></ha-icon>
        <span>${this._t(`last_connection`,{time:V(t.departure)})}</span>
        <span class="alt-lines">
          ${K(t).map(t=>this._renderBadge(t,e))}
        </span>
      </p>
    `}_empty(e,t,n,r=!0){return D`
      <div class="empty" role=${r?`status`:k}>
        <ha-icon icon=${e} aria-hidden="true"></ha-icon>
        <p class="empty-title">${t}</p>
        ${n?D`<p class="empty-detail">${n}</p>`:k}
      </div>
    `}_changesText(e){return e.interchanges===0?this._t(`direct`):e.interchanges===1?this._t(`changes_one`):this._t(`changes_many`,{n:e.interchanges})}_tripSummary(e){return this._t(`trip_summary`,{dep:V(e.departure),arr:V(e.arrival),changes:this._changesText(e)})}_heroSub(e){return[e.duration_minutes===null?``:this._t(`minutes`,{n:e.duration_minutes}),this._changesText(e)].filter(Boolean).join(`, `)}_renderHero(e,t){if(t.planned_for)return this._renderPlannedHero(e);let n=_t(e.departure,this._now),r=n===0,i=r?this._t(`now`):this._t(`minutes_long`,{n:n??0}),a=this._heroSub(e);return D`
      <div class="hero">
        <p class="hero-count">
          <span class="hero-label">${this._t(`leave_in`)}</span>
          <span class="hero-metric" aria-hidden="true">
            ${r?this._t(`now`):D`${n??`–`}<span class="hero-unit">min</span>`}
          </span>
          <span class="sr-only">${i}</span>
        </p>
        <div class="hero-meta">
          <p class="hero-times">
            <span aria-hidden="true">${V(e.departure)} – ${V(e.arrival)}</span>
            <span class="sr-only">${this._tripSummary(e)}</span>
          </p>
          <p class="hero-sub">${a}</p>
        </div>
      </div>
    `}_renderPlannedHero(e){let t=this._heroSub(e);return D`
      <div class="hero">
        <p class="hero-count">
          <span class="hero-label">${this._t(`planned_departs`,{day:this._dayText(e.departure)})}</span>
          <time class="hero-metric" datetime=${e.departure??``}>${V(e.departure)}</time>
        </p>
        <div class="hero-meta">
          <p class="hero-times">${this._t(`planned_arrives`,{time:V(e.arrival)})}</p>
          <p class="hero-sub">${t}</p>
        </div>
      </div>
    `}_renderNotices(e,t){let n=new Set(K(e).map(e=>e.line??``)),r=this._liftOutages(e,t).map(e=>({title:this._t(`lift_out_notice`,{station:e.station??``}),detail:[e.description,e.reason].map(e=>(e??``).trim()).filter(Boolean).join(` · `)})),i=[...r,...(t.traffic_info??[]).filter(e=>(e.related_lines??[]).some(e=>n.has(e))).map(e=>({title:e.title,detail:``}))].slice(0,Sn+r.length);return i.length?D`
      <ul class="notices">
        ${i.map(e=>D`
            <li class="notice">
              <ha-icon icon="mdi:alert-outline" aria-hidden="true"></ha-icon>
              <span>
                <span class="sr-only">${this._t(`disruption`)}: </span>${e.title??``}
                ${e.detail?D`<span class="notice-detail">${e.detail}</span>`:k}
              </span>
            </li>
          `)}
      </ul>
    `:k}_liftOutages(e,t){let n=new Set(wt(e).filter(e=>e.kind===`elevator`&&e.stop_id).map(e=>e.stop_id));return(t.elevator_info??[]).filter(e=>(e.stop_ids??[]).some(e=>n.has(e)))}_renderAccess(e,t){let n=(e??[]).filter(e=>Ot(e));if(!n.length)return k;let r=new Set((t.elevator_info??[]).flatMap(e=>e.stop_ids??[]));return D`${n.map(e=>{let t=e.kind===`elevator`&&!!e.stop_id&&r.has(e.stop_id);return D`<span class=${t?`access access--out`:`access`}>
        <ha-icon
          class=${!t&&e.kind===`ramp`?`access-icon--ramp`:``}
          icon=${t?`mdi:alert-outline`:Et(e)}
          aria-hidden="true"
        ></ha-icon>
        ${this._t(Ot(e))}${t?D` · ${this._t(`lift_out`)}`:k}
      </span>`})}`}_lineStyle(e,t){return ft(e,{},t.line_colors??{})}_renderBadge(e,t){let n=this._lineStyle(e.line??``,t);return D`<span
      class="line-badge"
      style=${ze({background:n.background,color:n.color??`#fff`})}
      >${e.line}</span
    >`}_platformText(e){let t=e.origin.platform;if(!t)return``;let n=e.type===`ptMetro`||e.type?.startsWith(`ptTrain`);return this._t(n?`platform_track`:`platform_stop`,{p:t})}_renderStrand(e,t,n=``){let r=K(e),i=r[r.length-1];return D`
      <ol class="strand">
        ${r.map((i,a)=>{let o=this._lineStyle(i.line??``,t).background,s=e.transfers[a];return D`
            ${this._renderLeg(i,o,a===0,t,!!s&&a<r.length-1,r[a+1],a===0?Ct(e,`start`):void 0,n)}
            ${s&&a<r.length-1?this._renderTransfer(s,t,vt(i,s,r[a+1]),i.destination,r[a+1].origin):k}
          `})}
        ${i?D`
              <li class="stop stop--end">
                <span class="node node--end" aria-hidden="true"></span>
                ${this._renderStopTime(i.destination)}
                <span class="stop-name">${i.destination.name}</span>
                ${this._renderMapLink(i.destination)}
                ${this._renderAccess(Ct(e,`end`),t)}
              </li>
            `:k}
      </ol>
    `}_renderLeg(e,t,n,r,i,a,o,s=``){let c=Nt(e.type,e.line),l=e.stop_count===1?this._t(`stops_one`):this._t(`stops_many`,{n:e.stop_count}),u=e.stops??[],d=!!W(e.origin),f=s?`${s}#${G(e)}`:G(e),p=u.length>0&&this._openRides.has(f),ee=yn(`route-stops-${f}`),m=this._platformText(e);return D`
      <li
        class=${i?`leg leg--before-transfer`:`leg`}
        style=${ze({"--leg-colour":t})}
      >
        <div class="stop">
          <span class=${n?`node node--start`:`node`} aria-hidden="true"></span>
          ${this._renderStopTime(e.origin)}
          ${this._renderLiveMark(e)}
          <span class="stop-name">${e.origin.name}</span>
          ${this._renderMapLink(e.origin)}
          ${n?this._renderAccess(o,r):k}
        </div>
        <div class="ride">
          ${this._renderBadge(e,r)}
          ${c?D`<ha-icon class="type-icon" icon=${c} aria-hidden="true"></ha-icon>`:k}
          ${e.low_floor&&r.step_free?D`<ha-icon
                  class="type-icon"
                  icon="mdi:wheelchair-accessibility"
                  aria-hidden="true"
                ></ha-icon
                ><span class="sr-only">${this._t(`low_floor`)}</span>`:k}
          <span class="towards"
            >${e.towards?this._t(`towards`,{towards:e.towards}):``}${m?D` <span class="platform">${m}</span>`:k}</span
          >
        </div>
        <div class="ride-detail">
          ${u.length?D`<button
                type="button"
                class="stops-toggle"
                aria-expanded=${p?`true`:`false`}
                aria-controls=${ee}
                @click=${()=>this._toggleRide(f)}
              >
                ${l}
                <ha-icon
                  icon=${p?`mdi:chevron-up`:`mdi:chevron-down`}
                  aria-hidden="true"
                ></ha-icon>
              </button>`:D`<span class="ride-meta">${l}</span>`}
          ${this._renderFrequency(e)}
        </div>
        ${u.length?D`<ol
              class="leg-stops"
              id=${ee}
              aria-label=${this._t(`stops_between`,{line:e.line??``})}
              ?hidden=${!p}
            >
              ${u.map(e=>D`<li class="leg-stop">
                  <span class="leg-stop-dot" aria-hidden="true"></span>
                  <time class=${d?`time-late`:``} datetime=${e.time??``}
                    >${d?U(e.time):V(e.time)}</time
                  >
                  <span class="leg-stop-name">${e.name}</span>
                </li>`)}
            </ol>`:k}
        ${a?D`<div class="stop stop--arrive">
              <span class="node" aria-hidden="true"></span>
              <span class="sr-only">${this._t(`arrival`)}</span>
              ${this._renderStopTime(e.destination)}
              <span class="stop-name">${e.destination.name}</span>
              ${yt(e.destination,a.origin)?k:this._renderMapLink(e.destination)}
            </div>`:k}
      </li>
    `}_renderMapLink(e){if(this._config?.show_map_pins===!1)return k;let t=bn(e.name,e.latitude,e.longitude);if(!t)return k;let n=this._t(typeof e.latitude==`number`&&typeof e.longitude==`number`?`open_in_city_map`:`find_on_map`);return D`<a
      class="map-link"
      href=${t}
      target="_blank"
      rel="noopener noreferrer"
      title=${n}
      aria-label="${n}: ${e.name}"
      ><ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon
    ></a>`}_toggleRide(e){let t=new Set(this._openRides);t.delete(e)||t.add(e),this._openRides=t}_renderStopTime(e){let t=e.estimated??e.planned,n=W(e);return n?D`<span class="time-change">
      <s class="time-planned" aria-hidden="true">${n.planned}</s>
      <time class="time-late" datetime=${e.estimated??``}>${n.expected}</time>
      <span class="sr-only"
        >${this._t(`planned_late`,{time:n.planned,n:e.delay_minutes??0})}</span
      >
    </span>`:D`<time datetime=${t??``}>${V(t)}</time>`}_renderLiveMark(e){return e.realtime?D`<ha-icon class="live-mark" icon="mdi:access-point" aria-hidden="true"></ha-icon
      ><span class="sr-only">${this._t(`live`)}</span>`:k}_renderFrequency(e){let t=xt(e);return t?D`<span class="ride-frequency">
      ${`every`in t?this._t(`every_minutes`,{n:t.every}):this._t(`then_at`,{times:t.upcoming.join(`, `)})}
    </span>`:k}_riskText(e){switch(e.risk){case`at_risk`:return this._t(`risk_at_risk`,{n:Math.abs(e.slack_minutes)});case`tight`:return this._t(`risk_tight`,{n:e.slack_minutes});default:return this._t(`risk_ok`,{n:e.slack_minutes})}}_renderRisk(e){return D`
      <span class="risk" data-risk=${e.risk}>
        <ha-icon icon=${kt[e.risk]} aria-hidden="true"></ha-icon>
        <span>${this._riskText(e)}</span>
      </span>
    `}_renderTransfer(e,t,n=null,r,i){return D`
      <li class="transfer" data-risk=${e.risk}>
        <span class="node node--transfer" aria-hidden="true"></span>
        <span class="transfer-at">${this._t(`transfer`)}</span>
        ${e.walk_minutes>0?D`<span class="walk">
              <ha-icon icon="mdi:walk" aria-hidden="true"></ha-icon>
              ${this._t(`walk`,{n:e.walk_minutes})}
            </span>`:k}
        ${this._renderAccess(e.access,t)}
        ${this._renderRisk(e)}
        ${n?D`<span class="catchable">
              ${this._t(`next_catchable`,{time:U(n)})}
            </span>`:k}
        ${this._renderReplan(e,r,i)}
      </li>
    `}_renderReplan(e,t,n){if(!t||!n)return k;let r=zt(t,e.walk_minutes,this._now);return r===null||!this._canReplanFrom(n)?k:D`<button
      type="button"
      class="replan"
      ?disabled=${this._phase===`loading`}
      aria-label=${this._t(`replan_from_here_label`,{stop:n.name})}
      @click=${()=>this._replanFromHere(n,r)}
    >
      <ha-icon icon="mdi:directions-fork" aria-hidden="true"></ha-icon>
      <span>${this._t(`replan_from_here`)}</span>
    </button>`}_renderReplanBack(){let e=this._replanFrom;return e?D`<button type="button" class="replan-back" @click=${this._backToOrigin}>
      <ha-icon icon="mdi:arrow-u-left-top" aria-hidden="true"></ha-icon>
      <span>${this._t(`replan_back`,{stop:e.name})}</span>
    </button>`:k}_renderAlternatives(e,t){let n=yn(`route-alt-${this._config?.entity??``}`);return D`
      <div class="alternatives">
        <button
          type="button"
          class="alt-toggle"
          aria-expanded=${this._alternativesOpen?`true`:`false`}
          aria-controls=${n}
          @click=${()=>{this._alternativesOpen=!this._alternativesOpen}}
        >
          <ha-icon
            icon=${this._alternativesOpen?`mdi:chevron-up`:`mdi:chevron-down`}
            aria-hidden="true"
          ></ha-icon>
          ${this._t(`alternatives`,{n:e.length})}
        </button>
        <ul class="alt-list" id=${n} ?hidden=${!this._alternativesOpen}>
          ${e.map(e=>this._renderAlternative(e,t))}
        </ul>
      </div>
    `}_renderAlternative(e,t){let n=e.transfers.reduce((e,t)=>e===void 0||t.slack_minutes<e.slack_minutes?t:e,void 0),r=e.legs[0],i=r&&!r.walk?W(r.origin):null,a=St(e),o=this._openAlternatives.has(a),s=yn(`route-alt-detail-${a}`);return D`
      <li class=${o?`alt alt--open`:`alt`}>
        <button
          type="button"
          class="alt-summary"
          aria-expanded=${o?`true`:`false`}
          aria-controls=${s}
          @click=${()=>this._toggleAlternative(a)}
        >
          <span class="alt-times">
            <span aria-hidden="true"
              >${i?D`<s class="time-planned">${i.planned}</s>
                    <span class="time-late">${i.expected}</span>`:V(e.departure)}
              – ${V(e.arrival)}</span
            >
            <span class="sr-only"
              >${this._tripSummary(e)}${i?`, ${this._t(`planned_late`,{time:i.planned,n:r?.origin.delay_minutes??0})}`:``}</span
            >
          </span>
          <span class="alt-lines">
            ${K(e).map(e=>this._renderBadge(e,t))}
          </span>
          <span class="alt-meta">
            ${e.duration_minutes===null?``:this._t(`minutes`,{n:e.duration_minutes})}
          </span>
          ${n?this._renderRisk(n):k}
          <ha-icon
            class="alt-chevron"
            icon=${o?`mdi:chevron-up`:`mdi:chevron-down`}
            aria-hidden="true"
          ></ha-icon>
        </button>
        <!-- Always in the DOM so aria-controls resolves; filled only when open,
             since every alternative drawing its strand up front would be most
             of the card's DOM for rows nobody opened. -->
        <div class="alt-detail" id=${s} ?hidden=${!o}>
          ${o?D`${this._renderNotices(e,t)}
              ${this._renderStrand(e,t,`alt-${a}`)}`:k}
        </div>
      </li>
    `}_toggleAlternative(e){let t=new Set(this._openAlternatives);t.delete(e)||t.add(e),this._openAlternatives=t}static{this.styles=o`:host {
color-scheme: light dark;
display: block;
container-type: inline-size;
--wl-rt: var(--success-color, #43a047);
--wl-warning: var(--warning-color, #ffa000);
--wl-error: var(--error-color, #db4437);
--wl-alarm: color-mix(in srgb, var(--wl-error) 88%, #000);
--wl-on-alarm: #fff;
--wl-ok: #16853f;
--wl-tight: #3d434a;
--wl-radius-sm: var(--ha-border-radius-sm, 4px);
--wl-radius-md: var(--ha-border-radius-md, 8px);
--wl-pad-x: var(--ha-space-4, 16px);
--wl-pad-y: var(--ha-space-3, 12px);
--wl-row-gap: var(--ha-space-3, 12px);
--wl-metric-size: 2.25rem;
--strand-width: 4px;
--node-size: 12px;
--node-top: 5px;
--node-centre: calc(var(--node-top) + var(--node-size) / 2);
--stop-row: 22px;
--strand-x: 6px;
--leg-colour: var(--primary-color);
}
ha-card {
overflow: hidden;
font-family: "WL Sans", var(--ha-font-family-body, system-ui), sans-serif;
}
:host([layout="grid"]),
:host([layout="panel"]) {
block-size: 100%;
}
:host([layout="grid"]) ha-card,
:host([layout="panel"]) ha-card {
block-size: 100%;
}
ha-card.fixed-height {
display: flex;
flex-direction: column;
}
ha-card.fixed-height > .wrap {
flex: 1 1 auto;
min-block-size: 0;
overflow-y: auto;
}
.wrap {
display: flex;
flex-direction: column;
gap: var(--wl-row-gap);
padding: var(--wl-pad-y) var(--wl-pad-x);
}
p {
margin: 0;
}
time {
font-variant-numeric: tabular-nums;
}
.sr-only {
position: absolute;
width: 1px;
height: 1px;
overflow: hidden;
clip-path: inset(50%);
white-space: nowrap;
}
.header {
display: flex;
flex-wrap: wrap;
align-items: center;
justify-content: space-between;
gap: 2px 12px;
}
.heading {
display: flex;
align-items: center;
gap: 8px;
min-width: 0;
margin: 0;
font-size: 1rem;
font-weight: 600;
line-height: 1.3;
color: var(--primary-text-color);
}
.heading ha-icon {
--mdc-icon-size: 20px;
color: var(--secondary-text-color);
flex: none;
}
.heading span {
min-width: 0;
overflow-wrap: anywhere;
}
.hero {
display: flex;
flex-wrap: wrap;
align-items: flex-end;
justify-content: space-between;
gap: 4px 16px;
}
.hero-count {
display: flex;
flex-direction: column;
}
.hero-label {
font-size: 0.85rem;
color: var(--secondary-text-color);
}
.hero-metric {
font-size: var(--wl-metric-size);
font-weight: 700;
line-height: 1;
font-variant-numeric: tabular-nums;
color: var(--primary-text-color);
}
.hero-unit {
font-size: 1rem;
font-weight: 600;
margin-inline-start: 4px;
}
.hero-meta {
text-align: end;
}
.hero-times {
font-size: 1.15rem;
font-weight: 600;
color: var(--primary-text-color);
}
.hero-sub {
font-size: 0.85rem;
color: var(--secondary-text-color);
}
.strand {
list-style: none;
margin: 0;
padding: 0;
}
.leg,
.transfer,
.stop--end {
position: relative;
padding-inline-start: calc(var(--strand-x) * 2 + var(--node-size));
}
.leg::before {
content: "";
position: absolute;
inset-inline-start: calc(var(--strand-x) + var(--node-size) / 2 - var(--strand-width) / 2);
top: var(--node-centre);
bottom: calc(-1 * var(--node-centre));
width: var(--strand-width);
border-radius: 2px;
background: var(--leg-colour);
}
.leg--before-transfer::before {
bottom: calc(var(--stop-row) - var(--node-centre));
}
.transfer::before {
content: "";
position: absolute;
inset-inline-start: calc(var(--strand-x) + var(--node-size) / 2 - 1px);
top: calc(var(--node-centre) - var(--stop-row));
bottom: calc(-1 * var(--node-centre));
border-inline-start: 2px dotted var(--secondary-text-color);
}
.node {
position: absolute;
inset-inline-start: var(--strand-x);
top: var(--node-top);
width: var(--node-size);
height: var(--node-size);
box-sizing: border-box;
border-radius: 50%;
background: var(--card-background-color, var(--ha-card-background, #fff));
border: 3px solid var(--leg-colour);
z-index: 1;
}
.node--start {
background: var(--leg-colour);
}
.node--transfer {
top: 50%;
transform: translateY(-50%);
border-color: var(--secondary-text-color);
}
.node--end {
border-color: var(--primary-text-color);
background: var(--primary-text-color);
}
.stop {
display: flex;
flex-wrap: wrap;
align-items: baseline;
gap: 2px 8px;
min-height: var(--stop-row);
}
.stop time {
font-weight: 700;
color: var(--primary-text-color);
}
.stop--arrive {
position: relative;
}
.stop--arrive .node {
inset-inline-start: calc(var(--strand-x) - (var(--strand-x) * 2 + var(--node-size)));
}
.stop--arrive time {
font-weight: 600;
}
.stop--arrive .stop-name {
font-weight: 400;
}
.stop-name {
font-weight: 600;
color: var(--primary-text-color);
}
.map-link {
position: relative;
display: inline-flex;
align-self: baseline;
margin-inline-start: -4px;
border-radius: var(--wl-radius-sm);
color: var(--secondary-text-color);
--mdc-icon-size: 16px;
}
.map-link::before {
content: "";
position: absolute;
inset: -4px;
}
.map-link:hover {
color: var(--primary-text-color);
}
.map-link ha-icon {
display: block;
}
.towards .platform {
margin-inline-start: 4px;
}
.platform {
font-size: 0.8rem;
color: var(--secondary-text-color);
}
.ride {
display: flex;
flex-wrap: wrap;
align-items: center;
gap: 4px 8px;
padding-block: 6px 2px;
font-size: 0.9rem;
color: var(--secondary-text-color);
}
.line-badge {
display: inline-block;
min-width: 2.4em;
padding: 2px 8px;
border-radius: 6px;
text-align: center;
font-weight: 700;
font-size: 0.85rem;
color: #fff;
forced-color-adjust: none;
}
.type-icon {
--mdc-icon-size: 18px;
}
.towards {
color: var(--primary-text-color);
}
.ride-detail {
display: flex;
flex-wrap: wrap;
align-items: center;
gap: 2px 12px;
padding-block: 0 12px;
font-size: 0.85rem;
color: var(--secondary-text-color);
}
.ride-frequency {
margin-inline-start: auto;
}
.time-change {
display: inline-flex;
align-items: baseline;
gap: 6px;
}
.time-planned {
font-weight: 400;
color: var(--secondary-text-color);
text-decoration-thickness: 1.5px;
font-variant-numeric: tabular-nums;
}
.time-change .time-late,
.alt-times .time-late,
.leg-stop .time-late {
color: color-mix(in srgb, var(--wl-error) 85%, var(--primary-text-color));
font-weight: 700;
}
.live-mark {
--mdc-icon-size: 16px;
display: flex;
align-self: baseline;
width: var(--mdc-icon-size);
height: var(--mdc-icon-size);
transform: translateY(calc(var(--mdc-icon-size) / 2 - 0.35em));
color: var(--wl-rt);
}
.access {
display: inline-flex;
align-items: baseline;
gap: 2px;
font-size: 0.8rem;
color: var(--secondary-text-color);
}
.access ha-icon {
--mdc-icon-size: 16px;
display: flex;
align-self: center;
width: var(--mdc-icon-size);
height: var(--mdc-icon-size);
}
.access ha-icon.access-icon--ramp {
transform: translateY(-2px);
}
.access--out {
padding: 2px 6px;
border-radius: var(--wl-radius-sm);
background: var(--wl-alarm);
color: var(--wl-on-alarm);
font-weight: 600;
}
.stops-toggle {
display: inline-flex;
align-items: center;
gap: 2px;
min-height: 32px;
padding: 0 4px;
margin-inline-start: -4px;
border: none;
border-radius: var(--wl-radius-sm);
background: none;
color: inherit;
font: inherit;
cursor: pointer;
}
.stops-toggle ha-icon {
--mdc-icon-size: 18px;
}
.leg-stops {
--stops-ahead-dot-size: 8px;
list-style: none;
margin: 0;
padding: 0 0 12px;
display: flex;
flex-direction: column;
gap: 6px;
font-size: 0.85rem;
color: var(--secondary-text-color);
}
.leg-stops[hidden] {
display: none;
}
.leg-stop {
position: relative;
display: flex;
align-items: baseline;
gap: 8px;
}
.leg-stop time {
font-variant-numeric: tabular-nums;
}
.leg-stop-name {
color: var(--primary-text-color);
}
.leg-stop-dot {
position: absolute;
inset-inline-start: calc(
var(--strand-x) + var(--node-size) / 2 - var(--stops-ahead-dot-size) / 2 -
(var(--strand-x) * 2 + var(--node-size))
);
top: 50%;
width: var(--stops-ahead-dot-size);
height: var(--stops-ahead-dot-size);
box-sizing: border-box;
transform: translateY(-50%);
border-radius: 50%;
background: var(--card-background-color, var(--ha-card-background, #fff));
border: 2px solid var(--leg-colour);
z-index: 1;
}
.transfer {
display: flex;
flex-wrap: wrap;
align-items: center;
gap: 4px 8px;
padding-block: 8px;
font-size: 0.85rem;
color: var(--secondary-text-color);
}
.catchable {
font-weight: 600;
color: var(--primary-text-color);
}
.walk {
display: inline-flex;
align-items: center;
gap: 2px;
}
.walk ha-icon {
--mdc-icon-size: 16px;
}
.replan {
display: inline-flex;
align-items: center;
gap: 4px;
min-height: 32px;
margin-inline-start: auto;
padding: 0 6px;
border: none;
border-radius: var(--wl-radius-sm);
background: none;
color: var(--primary-color);
font: inherit;
font-size: 0.8rem;
font-weight: 600;
cursor: pointer;
}
.replan ha-icon {
display: block;
--mdc-icon-size: 16px;
}
.replan[disabled] {
opacity: 0.5;
cursor: default;
}
@media (hover: hover) {
.replan:hover:not([disabled]) {
background: color-mix(in srgb, var(--primary-color) 12%, transparent);
}
}
.replan-back {
display: inline-flex;
align-items: center;
gap: 6px;
min-height: 36px;
margin-block-end: 4px;
padding: 0 10px 0 6px;
border: none;
border-radius: var(--wl-radius-md);
background: var(--secondary-background-color, rgb(127 127 127 / 0.12));
color: var(--primary-text-color);
font: inherit;
font-size: 0.85rem;
font-weight: 600;
cursor: pointer;
}
.replan-back ha-icon {
--mdc-icon-size: 18px;
color: var(--primary-color);
}
.stop--end {
display: flex;
flex-wrap: wrap;
align-items: baseline;
gap: 2px 8px;
}
.risk {
display: inline-flex;
align-items: center;
gap: 4px;
padding: 4px 8px;
border-radius: var(--wl-radius-sm);
background: var(--wl-ok);
color: var(--wl-on-alarm);
font-size: 0.8rem;
font-weight: 600;
line-height: 1;
}
.risk > span {
text-box: trim-both cap alphabetic;
}
.risk ha-icon {
display: block;
}
.risk[data-risk="tight"] {
background: var(--wl-tight);
box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.14);
}
.risk[data-risk="at_risk"] {
background: var(--wl-alarm);
color: var(--wl-on-alarm);
}
.risk ha-icon {
--mdc-icon-size: 16px;
}
.notices {
list-style: none;
margin: 0;
padding: 0;
display: flex;
flex-direction: column;
gap: 6px;
}
.notice {
display: flex;
gap: 8px;
align-items: flex-start;
padding: 8px 10px;
border-radius: var(--wl-radius-md);
background: color-mix(in srgb, var(--wl-warning) 18%, transparent);
color: var(--primary-text-color);
font-size: 0.85rem;
}
.notice ha-icon {
--mdc-icon-size: 18px;
flex: none;
}
.notice > span {
min-width: 0;
overflow-wrap: anywhere;
}
.notice-detail {
display: block;
margin-top: 2px;
font-size: 0.8rem;
color: var(--secondary-text-color);
}
.alternatives {
border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
padding-top: 8px;
}
.alt-toggle {
display: inline-flex;
align-items: center;
gap: 4px;
min-height: 44px;
padding: 0 8px 0 0;
border: none;
background: none;
color: var(--primary-text-color);
font: inherit;
font-weight: 600;
cursor: pointer;
max-width: 100%;
text-align: start;
overflow-wrap: anywhere;
}
.alt-list {
list-style: none;
margin: 0;
padding: 0;
}
.alt-list[hidden] {
display: none;
}
.alt {
border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
}
.alt-summary {
display: flex;
flex-wrap: wrap;
align-items: center;
gap: 6px 10px;
width: calc(100% + 16px);
min-height: 44px;
margin-inline: -8px;
padding: 8px;
border: none;
border-radius: var(--wl-radius-sm);
background: none;
color: inherit;
font: inherit;
text-align: start;
cursor: pointer;
}
.alt-summary:hover {
background: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
}
.alt-chevron {
--mdc-icon-size: 20px;
margin-inline-start: auto;
color: var(--secondary-text-color);
}
.alt-detail {
display: flex;
flex-direction: column;
gap: 8px;
padding-block: 4px 12px;
}
.alt-detail[hidden] {
display: none;
}
.alt:first-child {
border-top: none;
}
.alt-times {
font-weight: 700;
color: var(--primary-text-color);
}
.alt-lines {
display: inline-flex;
flex-wrap: wrap;
gap: 4px;
}
.alt-meta {
font-size: 0.85rem;
color: var(--secondary-text-color);
}
.last-connection {
display: flex;
flex-wrap: wrap;
align-items: center;
gap: 6px 8px;
font-size: 0.85rem;
color: var(--primary-text-color);
}
.last-connection ha-icon {
--mdc-icon-size: 18px;
color: var(--secondary-text-color);
}
.empty {
display: flex;
flex-direction: column;
align-items: center;
gap: 4px;
padding: 18px 12px;
text-align: center;
}
.empty ha-icon {
--mdc-icon-size: 28px;
color: var(--secondary-text-color);
}
.empty-title {
font-weight: 600;
color: var(--primary-text-color);
}
.empty-detail {
font-size: 0.85rem;
color: var(--secondary-text-color);
}
.attribution {
font-size: 0.7rem;
color: var(--secondary-text-color);
}
.updated {
display: inline-flex;
align-items: center;
gap: 4px;
margin-inline-start: auto;
min-width: 0;
font-size: 0.75rem;
color: var(--secondary-text-color);
}
.updated ha-icon {
--mdc-icon-size: 14px;
}
.pickers {
display: grid;
grid-template-columns: minmax(0, 1fr) auto;
gap: 8px;
align-items: center;
margin: 0;
padding: 0;
border: none;
min-inline-size: 0;
}
.pickers > .picker--from {
grid-column: 1;
grid-row: 1;
}
.pickers > .picker--to {
grid-column: 1;
grid-row: 2;
}
.pickers > .picker {
display: flex;
flex-direction: column;
gap: 4px;
min-width: 0;
}
.swap {
grid-column: 2;
grid-row: 1 / span 2;
display: inline-flex;
align-items: center;
justify-content: center;
width: 44px;
height: 44px;
padding: 0;
border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
border-radius: 50%;
background: transparent;
color: var(--primary-text-color);
cursor: pointer;
}
.swap:disabled {
cursor: default;
color: var(--disabled-text-color, var(--secondary-text-color));
}
.combo-label {
font-size: 0.85rem;
color: var(--secondary-text-color);
}
.combo-field {
position: relative;
display: flex;
align-items: center;
}
.combo-field input {
min-height: 44px;
box-sizing: border-box;
width: 100%;
padding: 0 44px 0 12px;
border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
border-radius: var(--wl-radius-md);
background: var(--card-background-color, transparent);
color: var(--primary-text-color);
font: inherit;
}
.combo-field[data-open] input {
border-color: var(--primary-color);
}
.combo-field input[aria-invalid="true"] {
border-color: var(--wl-error);
}
.combo-toggle {
position: absolute;
inset-inline-end: 0;
display: inline-flex;
align-items: center;
justify-content: center;
width: 44px;
height: 44px;
padding: 0;
border: none;
background: none;
color: var(--secondary-text-color);
cursor: pointer;
}
.combo-list {
list-style: none;
margin: 0;
padding: 4px 0;
max-height: 240px;
overflow-y: auto;
overscroll-behavior: contain;
border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
border-radius: var(--wl-radius-md);
background: var(--card-background-color, var(--ha-card-background, #fff));
}
.combo-list[hidden] {
display: none;
}
.combo-option {
display: flex;
align-items: center;
min-height: 40px;
padding: 4px 12px;
color: var(--primary-text-color);
cursor: pointer;
}
.combo-option[data-enter] {
background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
box-shadow: inset 3px 0 0 var(--primary-color);
}
.combo-option[data-current] {
font-weight: 600;
}
.combo-option:hover {
background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
}
.combo-option[aria-selected="true"] {
background: color-mix(in srgb, var(--primary-color) 20%, transparent);
outline: 2px solid var(--primary-color);
outline-offset: -2px;
}
.combo-note {
font-size: 0.8rem;
color: var(--secondary-text-color);
}
.field-error {
font-size: 0.8rem;
color: var(--primary-text-color);
}
.when {
display: flex;
flex-wrap: wrap;
align-items: center;
gap: 8px;
margin: 0;
padding: 0;
border: none;
min-inline-size: 0;
}
.when-modes {
display: inline-flex;
flex-wrap: wrap;
gap: 4px;
}
.when-mode {
position: relative;
display: inline-flex;
}
.when-mode input {
position: absolute;
inset: 0;
margin: 0;
opacity: 0;
cursor: pointer;
}
.when-mode span {
display: inline-flex;
align-items: center;
min-height: 32px;
padding: 0 12px;
box-sizing: border-box;
border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
border-radius: 999px;
color: var(--primary-text-color);
font-size: 0.85rem;
font-weight: 600;
}
.when-mode input:checked + span {
border-color: var(--primary-color);
background: color-mix(in srgb, var(--primary-color) 20%, transparent);
}
.when-mode input:focus-visible + span {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
.when-field {
display: inline-flex;
flex: 1 1 12rem;
min-width: 0;
}
.when-field input {
width: 100%;
min-height: 32px;
box-sizing: border-box;
padding: 0 12px;
border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
border-radius: var(--wl-radius-md);
background: var(--card-background-color, transparent);
color: var(--primary-text-color);
font: inherit;
}
.pager {
display: grid;
grid-template-columns: 1fr minmax(0, auto) 1fr;
align-items: center;
gap: 8px;
}
.page {
display: inline-flex;
align-items: center;
gap: 2px;
min-height: 32px;
padding: 0 8px 0 0;
border: none;
border-radius: var(--wl-radius-sm);
background: none;
color: var(--primary-text-color);
font: inherit;
font-size: 0.85rem;
font-weight: 600;
cursor: pointer;
}
.page--earlier {
grid-column: 1;
justify-self: start;
}
.page--later {
grid-column: 3;
justify-self: end;
padding: 0 0 0 8px;
}
.pager-note {
grid-column: 2;
display: flex;
align-items: center;
justify-content: center;
gap: 4px;
margin: 0;
color: var(--secondary-text-color);
font-size: 0.8rem;
line-height: 1.2;
text-align: center;
font-variant-numeric: tabular-nums;
}
.pager-note ha-icon {
flex: none;
--mdc-icon-size: 16px;
}
.tip {
display: inline-flex;
flex: none;
}
.tip-button {
display: inline-flex;
align-items: center;
justify-content: center;
width: 24px;
height: 24px;
padding: 0;
border: none;
border-radius: 50%;
background: none;
color: var(--secondary-text-color);
cursor: pointer;
anchor-name: --wl-pager-why;
}
@media (hover: hover) {
.tip-button:hover {
color: var(--primary-text-color);
}
}
.tip-bubble {
box-sizing: border-box;
width: max-content;
max-width: min(18rem, calc(100vw - 32px));
padding: 8px 12px;
border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
border-radius: var(--wl-radius-md);
background: var(--card-background-color, var(--ha-card-background, Canvas));
color: var(--primary-text-color, CanvasText);
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.24);
font-size: 0.85rem;
font-weight: 400;
line-height: 1.4;
text-align: start;
text-wrap: pretty;
}
@supports (anchor-name: --a) {
.tip-bubble {
inset: auto;
margin: 6px 0;
position-anchor: --wl-pager-why;
position-area: bottom;
position-try-fallbacks:
bottom span-left,
bottom span-right,
top,
top span-left,
top span-right;
}
}
.page ha-icon {
display: block;
--mdc-icon-size: 18px;
color: var(--primary-color);
}
.page[aria-disabled="true"] {
opacity: 0.5;
cursor: default;
}
@media (hover: hover) {
.page:hover:not([aria-disabled="true"]) {
background: color-mix(in srgb, var(--primary-color) 12%, transparent);
}
}
.picker-status {
font-size: 0.85rem;
color: var(--secondary-text-color);
}
.results {
display: flex;
flex-direction: column;
gap: var(--wl-row-gap);
}
.paused {
display: flex;
flex-wrap: wrap;
align-items: center;
gap: 8px;
padding: 6px 10px;
border-radius: var(--wl-radius-md);
background: color-mix(in srgb, var(--secondary-text-color) 12%, transparent);
color: var(--primary-text-color);
font-size: 0.85rem;
}
.paused > span {
flex: 1;
}
.paused ha-icon {
--mdc-icon-size: 18px;
}
.stale-note {
display: flex;
align-items: center;
gap: 6px;
margin: 0;
font-size: 0.8rem;
color: var(--secondary-text-color);
}
.stale-note ha-icon {
--mdc-icon-size: 16px;
}
.paused > button {
min-height: 44px;
padding: 0 14px;
border: 1px solid var(--primary-text-color);
border-radius: 999px;
background: transparent;
color: var(--primary-text-color);
font: inherit;
font-weight: 600;
cursor: pointer;
}
.banner {
display: flex;
flex-wrap: wrap;
align-items: center;
gap: 10px;
padding: 10px 12px;
border-radius: var(--wl-radius-md);
background: color-mix(in srgb, var(--wl-warning) 16%, transparent);
color: var(--primary-text-color);
font-size: 0.85rem;
}
.banner > span {
flex: 1 1 8rem;
min-width: 0;
overflow-wrap: anywhere;
}
.banner > button {
min-height: 32px;
padding: 0 14px;
border: 1px solid var(--primary-text-color);
border-radius: 999px;
background: transparent;
color: var(--primary-text-color);
font: inherit;
font-weight: 600;
cursor: pointer;
}
@container (max-width: 320px) {
.hero-meta {
text-align: start;
}
}
@container (max-width: 300px) {
.pager-note {
grid-column: 1 / -1;
grid-row: 2;
}
}
.alt-toggle:focus-visible,
.alt-summary:focus-visible,
.stops-toggle:focus-visible,
.map-link:focus-visible,
.combo-field input:focus-visible,
.when-field input:focus-visible,
button:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
border-radius: 6px;
}
@media (forced-colors: active) {
.access--out {
outline: 1px solid CanvasText;
}
.when-mode input:checked + span {
forced-color-adjust: none;
background: Highlight;
color: HighlightText;
}
.line-badge,
.risk,
.notice {
outline: 1px solid CanvasText;
}
.combo-option[aria-selected="true"] {
forced-color-adjust: none;
background: Highlight;
color: HighlightText;
}
.combo-option[data-enter] {
outline: 1px dashed Highlight;
outline-offset: -2px;
}
.leg::before,
.leg-stop-dot,
.node {
forced-color-adjust: none;
background: CanvasText;
border-color: CanvasText;
}
}
@media (prefers-reduced-motion: reduce) {
*,
*::before,
*::after {
animation-duration: 0.01ms !important;
animation-iteration-count: 1 !important;
transition-duration: 0.01ms !important;
}
}`}};J([F({attribute:!1})],$.prototype,`hass`,void 0),J([F({reflect:!0})],$.prototype,`layout`,void 0),J([F({type:Boolean})],$.prototype,`preview`,void 0),J([I()],$.prototype,`_config`,void 0),J([I()],$.prototype,`_versionMismatch`,void 0),J([I()],$.prototype,`_now`,void 0),J([I()],$.prototype,`_alternativesOpen`,void 0),J([I()],$.prototype,`_openRides`,void 0),J([I()],$.prototype,`_openAlternatives`,void 0),J([I()],$.prototype,`_stops`,void 0),J([I()],$.prototype,`_stopsError`,void 0),J([I()],$.prototype,`_from`,void 0),J([I()],$.prototype,`_to`,void 0),J([I()],$.prototype,`_timeMode`,void 0),J([I()],$.prototype,`_when`,void 0),J([I()],$.prototype,`_plan`,void 0),J([I()],$.prototype,`_replanFrom`,void 0),J([I()],$.prototype,`_phase`,void 0),J([I()],$.prototype,`_error`,void 0),J([I()],$.prototype,`_announcement`,void 0),J([I()],$.prototype,`_requestsLeft`,void 0),J([I()],$.prototype,`_secondNow`,void 0),$=J([je(R)],$);export{$ as WienerLinienAustriaRouteCard};
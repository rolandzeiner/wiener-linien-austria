/*! Wiener Linien Austria — bundled by Rolldown. Edit sources in src/, then `npm run build`. */
var e=Object.defineProperty,t=(t,n)=>{let r={};for(var i in t)e(r,i,{get:t[i],enumerable:!0});return n||e(r,Symbol.toStringTag,{value:`Module`}),r};
/**
* @license
* Copyright 2019 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const n=globalThis,r=n.ShadowRoot&&(n.ShadyCSS===void 0||n.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,i=Symbol(),a=new WeakMap;var o=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(r&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=a.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&a.set(t,e))}return e}toString(){return this.cssText}};const s=e=>new o(typeof e==`string`?e:e+``,void 0,i),c=(e,...t)=>new o(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,i),l=(e,t)=>{if(r)e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let r of t){let t=document.createElement(`style`),i=n.litNonce;i!==void 0&&t.setAttribute(`nonce`,i),t.textContent=r.cssText,e.appendChild(t)}},u=r?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return s(t)})(e):e,{is:d,defineProperty:ee,getOwnPropertyDescriptor:te,getOwnPropertyNames:ne,getOwnPropertySymbols:re,getPrototypeOf:ie}=Object,f=globalThis,ae=f.trustedTypes,oe=ae?ae.emptyScript:``,se=f.reactiveElementPolyfillSupport,p=(e,t)=>e,m={toAttribute(e,t){
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
switch(t){case Boolean:e=e?oe:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},h=(e,t)=>!d(e,t),ce={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:h};Symbol.metadata??=Symbol(`metadata`),f.litPropertyMetadata??=new WeakMap;var g=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ce){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&ee(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=te(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ce}static _$Ei(){if(this.hasOwnProperty(p(`elementProperties`)))return;let e=ie(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(p(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(p(`properties`))){let e=this.properties,t=[...ne(e),...re(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(u(e))}else e!==void 0&&t.push(u(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return l(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?m:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?m:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??h)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};g.elementStyles=[],g.shadowRootOptions={mode:`open`},g[p(`elementProperties`)]=new Map,g[p(`finalized`)]=new Map,se?.({ReactiveElement:g}),(f.reactiveElementVersions??=[]).push(`2.1.2`);
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const _=globalThis,v=e=>e,y=_.trustedTypes,le=y?y.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,ue=`$lit$`,b=`lit$${Math.random().toFixed(9).slice(2)}$`,de=`?`+b,fe=`<${de}>`,x=document,S=()=>x.createComment(``),C=e=>e===null||typeof e!=`object`&&typeof e!=`function`,w=Array.isArray,pe=e=>w(e)||typeof e?.[Symbol.iterator]==`function`,T=`[ 	
\f\r]`,E=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,D=/-->/g,O=/>/g,k=RegExp(`>|${T}(?:([^\\s"'>=/]+)(${T}*=${T}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),me=/'/g,A=/"/g,j=/^(?:script|style|textarea|title)$/i,M=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),N=Symbol.for(`lit-noChange`),P=Symbol.for(`lit-nothing`),he=new WeakMap,F=x.createTreeWalker(x,129);function ge(e,t){if(!w(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return le===void 0?t:le.createHTML(t)}const _e=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=E;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===E?c[1]===`!--`?o=D:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=k):(j.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=k):o=O:o===k?c[0]===`>`?(o=i??E,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?k:c[3]===`"`?A:me):o===A||o===me?o=k:o===D||o===O?o=E:(o=k,i=void 0);let d=o===k&&e[t+1].startsWith(`/>`)?` `:``;a+=o===E?n+fe:l>=0?(r.push(s),n.slice(0,l)+ue+n.slice(l)+b+d):n+b+(l===-2?t:d)}return[ge(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]};var I=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=_e(t,n);if(this.el=e.createElement(l,r),F.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=F.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(ue)){let t=u[o++],n=i.getAttribute(e).split(b),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?ye:r[1]===`?`?be:r[1]===`@`?xe:z}),i.removeAttribute(e)}else e.startsWith(b)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(j.test(i.tagName)){let e=i.textContent.split(b),t=e.length-1;if(t>0){i.textContent=y?y.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],S()),F.nextNode(),c.push({type:2,index:++a});i.append(e[t],S())}}}else if(i.nodeType===8){if(i.data===de)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(b,e+1))!==-1;)c.push({type:7,index:a}),e+=b.length-1}}a++}}static createElement(e,t){let n=x.createElement(`template`);return n.innerHTML=e,n}};function L(e,t,n=e,r){if(t===N)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=C(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=L(e,i._$AS(e,t.values),i,r)),t}var ve=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??x).importNode(t,!0);F.currentNode=r;let i=F.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new R(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Se(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=F.nextNode(),a++)}return F.currentNode=x,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},R=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=P,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=L(this,e,t),C(e)?e===P||e==null||e===``?(this._$AH!==P&&this._$AR(),this._$AH=P):e!==this._$AH&&e!==N&&this._(e):e._$litType$===void 0?e.nodeType===void 0?pe(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==P&&C(this._$AH)?this._$AA.nextSibling.data=e:this.T(x.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=I.createElement(ge(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new ve(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=he.get(e.strings);return t===void 0&&he.set(e.strings,t=new I(e)),t}k(t){w(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(S()),this.O(S()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=v(e).nextSibling;v(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},z=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=P,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=P}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=L(this,e,t,0),a=!C(e)||e!==this._$AH&&e!==N,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=L(this,r[n+o],t,o),s===N&&(s=this._$AH[o]),a||=!C(s)||s!==this._$AH[o],s===P?e=P:e!==P&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===P?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},ye=class extends z{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===P?void 0:e}},be=class extends z{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==P)}},xe=class extends z{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=L(this,e,t,0)??P)===N)return;let n=this._$AH,r=e===P&&n!==P||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==P&&(n===P||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Se=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){L(this,e)}};const Ce=_.litHtmlPolyfillSupport;Ce?.(I,R),(_.litHtmlVersions??=[]).push(`3.3.2`);const we=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new R(t.insertBefore(S(),e),e,void 0,n??{})}return i._$AI(e),i},B=globalThis
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
;var V=class extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=we(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return N}};V._$litElement$=!0,V.finalized=!0,B.litElementHydrateSupport?.({LitElement:V});const Te=B.litElementPolyfillSupport;Te?.({LitElement:V}),(B.litElementVersions??=[]).push(`4.2.2`);
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const H=e=>(t,n)=>{n===void 0?customElements.define(e,t):n.addInitializer(()=>{customElements.define(e,t)})},Ee={attribute:!0,type:String,converter:m,reflect:!1,hasChanged:h},De=(e=Ee,t,n)=>{
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function U(e){return(t,n)=>typeof n==`object`?De(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/function W(e){return U({...e,state:!0,attribute:!1})}
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const Oe={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},ke=e=>(...t)=>({_$litDirective$:e,values:t});var Ae=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};
/**
* @license
* Copyright 2018 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/const je=ke(class extends Ae{constructor(e){if(super(e),e.type!==Oe.ATTRIBUTE||e.name!==`style`||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{let r=e[n];return r==null?t:t+`${n=n.includes(`-`)?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,`-$&`).toLowerCase()}:${r};`},``)}update(e,[t]){let{style:n}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let e of this.ft)t[e]??(this.ft.delete(e),e.includes(`-`)?n.removeProperty(e):n[e]=null);for(let e in t){let r=t[e];if(r!=null){this.ft.add(e);let t=typeof r==`string`&&r.endsWith(` !important`);e.includes(`-`)||t?n.setProperty(e,t?r.slice(0,-11):r,t?`important`:``):n[e]=r}}return N}}),Me=`wl-austria-fonts`;function Ne(){if(typeof document>`u`||document.getElementById(Me))return;let e=document.createElement(`style`);e.id=Me,e.textContent=`
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
`,document.head.appendChild(e)}var Pe=t({common:()=>Fe,default:()=>Be,flap:()=>Re,modern:()=>Ie,retro:()=>Le,route:()=>ze}),Fe={editor:{add_chip:`Chip hinzufügen`,add_icon:`Symbol hinzufügen`,date_format_placeholder:`d.m.Y`,direction_label:`Fahrtrichtung`,direction_not_served:`nicht bedient`,direction_note_one_way:`Rückfahrt deaktiviert: {line} endet hier.`,direction_unavailable:`Keine Abfahrten in dieser Richtung`,entities:`Haltestellen`,entity:`Haltestelle`,header_amenities:`Symbole in diesem Slot`,header_bar_aria:`Stationsanzeige — Seite wählen`,header_chips_and_icons:`Textchips (max. {chips}) und Extra-Symbole (max. {icons})`,header_left:`Linke Seite`,header_pick_side_hint:`Seite antippen, dann unten füllen`,header_right:`Rechte Seite`,header_side_aria:`Seite der Stationsanzeige`,header_slot_empty:`leer`,line_active_aria:`Linie {line} aktiv`,line_inactive_aria:`Linie {line} inaktiv`,lines_empty_means_all:`leer = alle Linien`,lines_label:`Linien an dieser Haltestelle`,lines_selected:`{n} von {total}`,no_lines_hint:`Die Linien erscheinen, sobald diese Haltestelle Abfahrten meldet.`,no_lines_title:`Noch keine Linien verfügbar`,per_line_direction_aria:`Linie {line}: {direction}`,remove_chip_aria:`Chip {chip} entfernen`,remove_icon_aria:`Symbol {icon} entfernen`,remove_stop:`Haltestelle entfernen`,section_board:`Fallblatt-Tafel`,section_departure_row:`Abfahrtszeile`,section_extras:`Extras`,section_extras_hint:`optional`,section_footer:`Fußzeile`,section_header:`Stationsanzeige`,section_header_hint:`Direkt am Balken`,section_led_panel:`LED-Anzeige`,section_station:`Stationsband`,section_walk_time:`Gehzeit zur Haltestelle`,show_clock_short:`Uhr`,show_date_short:`Datum`,show_elevator_short:`Lift`,show_escalator_short:`Rolltreppe`,show_wc_short:`WC`,size_medium:`Mittel`,size_regular:`Standard`,size_small:`Klein`,tab_display:`Anzeige`,tab_stop:`Haltestelle`,tab_stops:`Haltestellen`,tab_tweaks:`Stil`,text_placeholder:`z. B. Name der nächsten Station`,walk_time_aria:`Gehzeit in Minuten für Linie {line} Richtung {towards}`,walk_time_branching_hint:`Gilt für alle Endstationen in dieser Richtung`,walk_time_hint:`Blendet Abfahrten aus, die ohne dich abfahren würden. Leer = kein Filter.`,walk_time_less_aria:`Gehzeit für Linie {line} verringern`,walk_time_more_aria:`Gehzeit für Linie {line} erhöhen`,walk_time_placeholder:`–`,walk_time_unit:`Minuten`}},Ie={no_data:`Keine Abfahrten verfügbar`,betriebsschluss:`Betriebsschluss`,stale_feed:`Keine aktuellen Daten`,stale_feed_detail:`Die Wiener Linien melden für diese Haltestelle veraltete Abfahrtszeiten. Sobald wieder Echtzeitdaten kommen, füllt sich die Anzeige automatisch.`,stale_feed_since:`Letzte gemeldete Abfahrt: {time}`,stale_feed_partial:`Einzelne Linien melden keine aktuellen Zeiten.`,min:`Min`,now:`Jetzt`,platform_short_rail:`Gleis`,platform_short_bus:`Steig`,version_update:`Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.`,entity_missing:`Sensor {entity} existiert nicht mehr. Wähle einen anderen Sensor oder entferne ihn aus den Haltestellen dieser Karte.`,no_entities_picked:`Keine Haltestelle ausgewählt`,no_entities_available:`Keine Wiener-Linien-Sensoren gefunden`,departures_list:`Kommende Abfahrten`,barrier_free_title:`Barrierefrei zugänglich`,cooling_title:`Klimatisiert`,disturbance_title:`Verkehrsbehinderung gemeldet`,stops_ahead_aria_show:`Streckenverlauf für {line} Richtung {towards} anzeigen`,stops_ahead_aria_hide:`Streckenverlauf für {line} Richtung {towards} ausblenden`,stops_ahead_other_show:`{count} weitere Linien bei {stop} anzeigen`,stops_ahead_other_hide:`Weitere Linien bei {stop} ausblenden`,dir_h:`Hinfahrt`,dir_r:`Rückfahrt`,dir_h_short:`H`,dir_r_short:`R`,dir_both:`Beide`,traffic_label:`Störung`,traffic_until:`Bis`,traffic_updated:`aktualisiert`,elevator_until:`Bis`,open_in_maps:`In Karte öffnen`,qr_open:`QR-Code anzeigen`,qr_dialog_title:`QR-Code für Haltestelle`,qr_dialog_hint:`Mit dem Smartphone scannen — öffnet die Haltestelle in der Karten-App.`,qr_dialog_close:`QR-Code schließen`,delay_singular:`1 Min. verspätet`,delay_plural:`{n} Min. verspätet`,devmode_title:`DEV`,devmode_traffic_btn:`Störung testen`,devmode_elevator_btn:`Aufzug testen`,devmode_colors_btn:`Linienfarben`,devmode_clear_btn:`Löschen`,editor:{accessibility_only:`Nur barrierefreie Abfahrten anzeigen`,accessibility_only_requires:`Braucht „Barrierefrei-Symbol anzeigen“.`,colors_empty_hint:`Wähle im ersten Reiter Haltestellen aus — ihre Linien erscheinen dann hier.`,colors_hint:`Optional. Ohne Überschreibung gilt die offizielle Linienfarbe.`,hide_attribution:`Datenquelle ausblenden`,hide_attribution_helper:`Wenn aktiv, wird die Quellenangabe ausgeblendet.`,hide_header:`Kopfzeile ausblenden`,hide_header_helper:`Wenn aktiv, wird die Titelleiste der Karte ausgeblendet.`,layout:`Layout mehrerer Haltestellen`,layout_requires:`Wirkt erst ab zwei Haltestellen.`,layout_stacked:`Gestapelt`,layout_tabs:`Reiter`,max_departures:`Anzahl Abfahrten pro Haltestelle`,pick_color_for_line:`Farbe für Linie {line} wählen`,reset_color:`Auf Standard zurücksetzen`,reset_color_aria:`Linienfarbe {line} auf Standard zurücksetzen`,section_colors:`Linienfarben`,section_colors_hint:`überschreibt API-Farbe`,section_departure_row_hint:`pro Zeile`,section_disruptions:`Störungen & Verspätungen`,section_layout:`Aufbau`,section_layout_hint:`Struktur`,show_accessibility:`Barrierefrei-Symbol anzeigen`,show_cooling:`Klimaanlagen-Symbol anzeigen`,show_cooling_helper:`Zeigt eine Schneeflocke neben Abfahrten mit klimatisiertem Fahrzeug. Wiener Linien melden das pro Fahrzeug — ältere Garnituren liefern die Angabe nicht.`,show_delay:`Verspätungen anzeigen`,show_delay_colors:`Verspätungen farblich hervorheben`,show_delay_colors_helper:`Färbt die Minutenzahl rot, wenn eine Abfahrt verspätet ist, und grün, wenn sie zu früh kommt.`,show_delay_colors_requires:`Braucht „Verspätungen anzeigen“.`,show_departures:`Abfahrtsliste anzeigen`,show_elevator_info:`Aufzugsausfälle anzeigen`,show_hero_metric:`Nächste Abfahrt groß anzeigen`,show_platform:`Gleis/Steig anzeigen`,show_qr_button:`QR-Code-Schaltfläche anzeigen`,show_stops_ahead:`Zwischenstationen anzeigen`,show_traffic_info:`Störungen anzeigen`,show_type_icon:`Verkehrsmittel-Symbol anzeigen`}},Le={editor:{accessibility_only:`Nur barrierefreie Abfahrten anzeigen`,chips:`Zusätzliche Beschriftungen`,date_format:`Datumsformat`,exit:`Ausgangssymbol`,extra_icons:`Zusätzliche Symbole`,flicker:`LED-Flackern simulieren`,header_exit_accessible:`Stufenloser Ausgang`,header_exit_none:`Kein`,header_exit_regular:`Ausgang`,housing:`LED-Gehäuserahmen anzeigen`,housing_helper:`Dunkler Rahmen um die LED-Anzeige mit dezentem Glas-Reflex obenauf.`,icon_mdi_door_open:`Offene Tür`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_stairs:`Treppe`,line_stripe:`Seitlichen Linienstreifen anzeigen`,line_stripe_helper:`4-Pixel-Balken am linken Rand jeder Zeile in der Linienfarbe.`,message_text:`Nachricht`,message_text_requires:`Braucht „Lauftext anzeigen“.`,message_ticker:`Laufschrift`,message_ticker_helper:`Zeigt alle 5 Minuten eine eigene Nachricht als Laufschrift über die Anzeige.`,platform_side:`Gleis/Steig-Seite`,platform_side_auto:`Automatisch (1 = rechts, 2 = links)`,platform_side_helper:`Standard folgt der Wiener-Linien-Beschilderung (Gleis 2 links, sonst rechts). Manuell überschreibbar.`,platform_side_left:`Immer links`,platform_side_requires:`Braucht „Steig anzeigen“.`,platform_side_right:`Immer rechts`,show_clock:`Uhr-Plakette anzeigen`,show_date:`Datums-Plakette anzeigen`,show_header:`Stationsanzeige anzeigen`,show_header_helper:`Hauptschalter. Einstellungen pro Seite bleiben gespeichert.`,show_line_pill:`Linien-Plakette anzeigen`,show_line_pill_helper:`Liniencode als gefüllte Plakette in der Linienfarbe statt als schlichter Text.`,show_platform:`Steig anzeigen`,show_station_name:`Stationsnamen anzeigen`,show_unit:`Einheit „min“ anzeigen`,show_unit_helper:`Kleines „min“ in Amber-Versalien nach jeder Minutenzahl.`,size:`Größe`,station_bg:`Stationsschild-Hintergrund`,station_bg_black:`Schwarz`,station_bg_default:`Standard`,station_bg_white:`Weiß`,style:`Stil`,style_classic:`Klassisch`,style_pixel:`Punktmatrix`,style_warm:`Warm`,text:`Beschriftung`,wheelchair_race:`Rollstuhl-Rennen (Easter Egg)`},aria_dismiss_message:`Lauftext schließen`,aria_start_race:`Barrierefreiheits-Rennen starten`,at_platform:`Einfahrt`,barrier_free_title:`Barrierefrei zugänglich`,betriebsschluss:`Betriebsschluss`,countdown_minutes:`{n} Minuten`,departures_list:`Kommende Abfahrten`,dir_both:`Beide`,dir_h:`Hinfahrt`,dir_h_short:`H`,dir_r:`Rückfahrt`,dir_r_short:`R`,entity_missing:`Sensor {entity} existiert nicht mehr. Wähle oben einen anderen Sensor.`,gleis:`GLEIS`,header:{icon_exit:`Ausgang`,icon_exit_access:`Stufenloser Ausgang`,icon_wc:`WC`,icon_escalator:`Rolltreppe`,icon_elevator:`Aufzug`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_door_open:`Offene Tür`,icon_mdi_stairs:`Treppe`},no_data:`Keine Abfahrten`,no_data_wrong_direction:`Keine Abfahrten in dieser Richtung`,no_data_wrong_line:`Keine Abfahrten für diese Linie`,no_entity:`Keine Haltestelle ausgewählt`,race_finished:`Barrierefreiheits-Rennen beendet`,race_starting_in:`Rennen startet in {n}`,race_winner_announce:`Rollstuhl {n} gewinnt das Barrierefreiheits-Rennen`,stale_feed:`Keine aktuellen Daten`,steig:`STEIG`,unit_min:`min`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.`,version_update:`Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden`,via_prefix:`ÜBER`},Re={no_entity:`Keine Haltestelle ausgewählt`,no_data:`Keine Abfahrten`,no_data_wrong_direction:`Keine Abfahrten in dieser Richtung`,no_data_wrong_line:`Keine Abfahrten für diese Linie`,betriebsschluss:`Betriebsschluss`,stale_feed:`Keine aktuellen Daten`,dir_h:`Hinfahrt`,dir_r:`Rückfahrt`,dir_h_short:`H`,dir_r_short:`R`,gleis:`GLEIS`,steig:`STEIG`,col_line:`LINIE`,col_dest:`RICHTUNG`,col_step_free:`STUFENLOS`,col_cd:`ANKUNFT`,version_update:`Klappanzeige wurde auf v{v} aktualisiert — bitte neu laden`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.`,entity_missing:`Sensor {entity} existiert nicht mehr. Wähle oben einen anderen Sensor.`,departures_list:`Kommende Abfahrten`,at_platform:`Einfahrt`,countdown_minutes:`{n} Minuten`,barrier_free_title:`Barrierefrei zugänglich`,not_barrier_free_title:`Nicht barrierefrei`,unit_min:`min`,dir_both:`Beide`,header:{icon_exit:`Ausgang`,icon_exit_access:`Stufenloser Ausgang`,icon_wc:`WC`,icon_escalator:`Rolltreppe`,icon_elevator:`Aufzug`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_door_open:`Offene Tür`,icon_mdi_stairs:`Treppe`},editor:{accessibility_only:`Nur barrierefreie Abfahrten anzeigen`,accessibility_only_requires:`Braucht „Rollstuhl-Plakette anzeigen“.`,chips:`Zusätzliche Beschriftungen`,date_format:`Datumsformat`,exit:`Ausgangssymbol`,extra_icons:`Zusätzliche Symbole`,header_exit_accessible:`Stufenloser Ausgang`,header_exit_none:`Kein`,header_exit_regular:`Ausgang`,hide_attribution:`Datenquelle ausblenden`,hide_attribution_helper:`Wenn aktiv, wird die CC-BY-Quellenangabe am unteren Rand der Karte ausgeblendet. Die OGD-Lizenz der Wiener Linien verlangt eine sichtbare Quellenangabe, sofern der Hinweis nicht an anderer Stelle im Dashboard erscheint.`,housing:`Gehäuserahmen anzeigen`,housing_helper:`Umrahmt die Tafel mit dem Gehäuse inkl. dezenter Innenkante und Schlagschatten. Gehäusefarbe folgt dem HA-Theme (cremefarben im Hellmodus, dunkel im Dunkelmodus). Aus = Tafel sitzt bündig auf dem Dashboard.`,icon_mdi_door_open:`Offene Tür`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_stairs:`Treppe`,max_rows:`Anzahl Zeilen`,max_rows_helper:`Wie viele Abfahrten die Tafel zeigt (1–8). Über alle Haltestellen zusammengeführt, nach Abfahrtszeit sortiert.`,show_accessibility:`Rollstuhl-Plakette anzeigen`,show_accessibility_helper:`Zeigt eine Rollstuhl-Plakette neben barrierefreien Abfahrten.`,show_clock:`Uhr-Plakette anzeigen`,show_date:`Datums-Plakette anzeigen`,show_header:`Stationsanzeige anzeigen`,show_header_helper:`Hauptschalter. Einstellungen pro Seite bleiben gespeichert.`,show_line_column:`Linienspalte anzeigen`,show_line_column_helper:`Zeigt die Spalte mit dem Liniencode. Ausschalten, wenn die Tafel ohnehin nur eine Linie zeigt.`,show_min_unit:`Einheit „min“ anzeigen`,show_min_unit_helper:`Kleines „min“ neben der Minutenzahl, wie auf echten Stationstafeln.`,show_platform:`Gleis/Steig anzeigen`,show_platform_helper:`Fügt jeder Zeile eine eigene Gleis-Plakette zwischen Ziel und Minutenzahl hinzu. Wird nur eingeblendet, wenn mindestens eine sichtbare Zeile einen Gleis-Wert hat.`,show_station_name:`Stationsnamen anzeigen`,show_station_name_helper:`Farbiges Band mit Stationsname und Uhrzeit am oberen Rand der Karte.`,size:`Größe`,station_bg:`Hintergrund Stationsschild`,station_bg_black:`Schwarz`,station_bg_helper:`Standard ist die Farbe der ersten erfassten Linie (z. B. Rot für U1, Orange für U3). Bei mehreren Linien kann eine bestimmte Linie gewählt oder auf Weiß bzw. Schwarz umgestellt werden.`,station_bg_line:`Erste Linie`,station_bg_white:`Weiß`,text:`Beschriftung`}},ze={heading_fallback:`Verbindung`,leave_in:`Abfahrt in`,now:`Jetzt`,minutes:`{n} min`,minutes_long:`{n} Minuten`,trip_minutes:`{n} min unterwegs`,direct:`Direkt`,changes_one:`1 Umstieg`,changes_many:`{n} Umstiege`,platform_track:`Gleis {p}`,platform_stop:`Steig {p}`,stops_one:`1 Station`,stops_many:`{n} Stationen`,walk:`{n} min Fußweg`,towards:`Richtung {towards}`,late:`{n} min später`,risk_ok:`{n} min Puffer`,risk_tight:`Knapp: {n} min Puffer`,risk_at_risk:`Anschluss gefährdet: {n} min zu wenig`,transfer_at:`Umstieg {at}`,alternatives:`Weitere Verbindungen ({n})`,disruption:`Störung`,inactive:`Außerhalb des Zeitfensters`,inactive_detail:`Aktualisiert {when}.`,no_trips:`Gerade keine Verbindung`,no_trips_detail:`Der Routenplaner findet nichts. Die nächste Aktualisierung versucht es erneut.`,unavailable:`Routenplaner nicht erreichbar`,unavailable_detail:`Verbindungen erscheinen wieder, sobald er antwortet.`,no_entity:`Keine Verbindung ausgewählt. Wähle im Editor eine Verbindung.`,entity_missing:`Sensor {entity} existiert nicht mehr. Wähle im Editor eine andere Verbindung.`,trip_summary:`{dep} bis {arr}, {changes}`,version_update:`Verbindungskarte wurde auf v{v} aktualisiert — bitte neu laden`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.`,editor:{entity:`Verbindung`,entity_helper:`Nur eingerichtete Verbindungen stehen zur Wahl. Start und Ziel legst du beim Einrichten der Verbindung fest.`,title:`Überschrift`,title_helper:`Leer lassen für „Start → Ziel“.`,alternatives:`Weitere Verbindungen`,alternatives_helper:`Wie viele spätere Verbindungen unter der besten stehen. 0 blendet sie aus.`,hide_attribution:`Datenquelle ausblenden`,hide_attribution_helper:`Die OGD-Lizenz der Wiener Linien verlangt eine sichtbare Quellenangabe, sofern sie nicht an anderer Stelle im Dashboard steht.`,no_routes:`Noch keine Verbindung eingerichtet. Start und Ziel legst du in der Integration fest, danach steht die Verbindung hier zur Wahl.`,add_route:`Verbindung einrichten`},not_a_route:`Das ist ein Abfahrtsmonitor, keine Verbindung. Wähle im Editor eine Verbindung.`},Be={common:Fe,modern:Ie,retro:Le,flap:Re,route:ze},Ve=t({common:()=>He,default:()=>qe,flap:()=>Ge,modern:()=>Ue,retro:()=>We,route:()=>Ke}),He={editor:{add_chip:`Add chip`,add_icon:`Add icon`,date_format_placeholder:`d.m.Y`,direction_label:`Direction`,direction_not_served:`not served`,direction_note_one_way:`Return direction disabled: {line} terminates here.`,direction_unavailable:`No departures in this direction`,entities:`Stops`,entity:`Stop`,header_amenities:`Icons in this slot`,header_bar_aria:`Station sign — choose a side`,header_chips_and_icons:`Text chips (max. {chips}) and extra icons (max. {icons})`,header_left:`Left side`,header_pick_side_hint:`Tap a side, then fill it in below`,header_right:`Right side`,header_side_aria:`Station sign side`,header_slot_empty:`empty`,line_active_aria:`Line {line} active`,line_inactive_aria:`Line {line} inactive`,lines_empty_means_all:`empty = all lines`,lines_label:`Lines at this stop`,lines_selected:`{n} of {total}`,no_lines_hint:`Lines appear as soon as this stop reports departures.`,no_lines_title:`No lines yet`,per_line_direction_aria:`Line {line}: {direction}`,remove_chip_aria:`Remove chip {chip}`,remove_icon_aria:`Remove icon {icon}`,remove_stop:`Remove stop`,section_board:`Split-flap board`,section_departure_row:`Departure row`,section_extras:`Extras`,section_extras_hint:`optional`,section_footer:`Footer`,section_header:`Station sign`,section_header_hint:`Edit on the bar`,section_led_panel:`LED panel`,section_station:`Station band`,section_walk_time:`Walking time to the stop`,show_clock_short:`Clock`,show_date_short:`Date`,show_elevator_short:`Elevator`,show_escalator_short:`Escalator`,show_wc_short:`WC`,size_medium:`Medium`,size_regular:`Standard`,size_small:`Small`,tab_display:`Display`,tab_stop:`Stop`,tab_stops:`Stops`,tab_tweaks:`Style`,text_placeholder:`e.g. name of the next station`,walk_time_aria:`Walking time in minutes for line {line} towards {towards}`,walk_time_branching_hint:`Applies to every terminus in this direction`,walk_time_hint:`Hides departures that would leave without you. Empty = no filter.`,walk_time_less_aria:`Decrease walking time for line {line}`,walk_time_more_aria:`Increase walking time for line {line}`,walk_time_placeholder:`–`,walk_time_unit:`minutes`}},Ue={no_data:`No departures available`,betriebsschluss:`End of service`,stale_feed:`No live data`,stale_feed_detail:`Wiener Linien is sending out-of-date departure times for this stop. Departures return automatically once live data resumes.`,stale_feed_since:`Last reported departure: {time}`,stale_feed_partial:`Some lines aren't reporting current times.`,min:`min`,now:`Now`,platform_short_rail:`Track`,platform_short_bus:`Bay`,version_update:`Wiener Linien Austria updated to v{v} — please reload`,version_reload:`Reload`,version_reload_stuck:`Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.`,entity_missing:`Sensor {entity} no longer exists. Pick a different sensor, or remove it from this card's stops.`,no_entities_picked:`No stop selected`,no_entities_available:`No Wiener Linien sensors found`,departures_list:`Upcoming departures`,barrier_free_title:`Step-free access`,cooling_title:`Air conditioned`,disturbance_title:`Traffic disruption reported`,stops_ahead_aria_show:`Show stops ahead for {line} towards {towards}`,stops_ahead_aria_hide:`Hide stops ahead for {line} towards {towards}`,stops_ahead_other_show:`Show {count} more lines at {stop}`,stops_ahead_other_hide:`Hide other lines at {stop}`,dir_h:`Outbound`,dir_r:`Return`,dir_h_short:`H`,dir_r_short:`R`,dir_both:`Both`,traffic_label:`Disruption`,traffic_until:`Until`,traffic_updated:`updated`,elevator_until:`Until`,open_in_maps:`Open in maps`,qr_open:`Show QR code`,qr_dialog_title:`QR code for stop`,qr_dialog_hint:`Scan with your phone — opens the stop in your maps app.`,qr_dialog_close:`Close QR code`,delay_singular:`1 min. late`,delay_plural:`{n} min. late`,devmode_title:`DEV`,devmode_traffic_btn:`Test disruption`,devmode_elevator_btn:`Test elevator`,devmode_colors_btn:`Line colours`,devmode_clear_btn:`Clear`,editor:{accessibility_only:`Only show step-free departures`,accessibility_only_requires:`Requires “Show accessibility icon”.`,colors_empty_hint:`Pick stops on the Stops tab — their lines will show up here.`,colors_hint:`Optional. Without an override the official line colour applies.`,hide_attribution:`Hide data source`,hide_attribution_helper:`When on, the data-source credit is hidden.`,hide_header:`Hide header`,hide_header_helper:`When on, the card title bar is hidden.`,layout:`Multi-stop layout`,layout_requires:`Only takes effect with two or more stops.`,layout_stacked:`Stacked`,layout_tabs:`Tabs`,max_departures:`Departures per stop`,pick_color_for_line:`Pick colour for line {line}`,reset_color:`Reset to default`,reset_color_aria:`Reset line colour {line} to default`,section_colors:`Line colours`,section_colors_hint:`overrides the API colour`,section_departure_row_hint:`per row`,section_disruptions:`Disruptions & delays`,section_layout:`Structure`,section_layout_hint:`Layout`,show_accessibility:`Show step-free icon`,show_cooling:`Show air-conditioning icon`,show_cooling_helper:`Shows a snowflake beside departures with an air-conditioned vehicle. Wiener Linien report this per vehicle — older trains and trams don't send it.`,show_delay:`Show delays`,show_delay_colors:`Colour-code delays`,show_delay_colors_helper:`Turns the countdown number red when a departure runs late and green when it runs early.`,show_delay_colors_requires:`Requires “Show delays”.`,show_departures:`Show departure list`,show_elevator_info:`Show elevator outages`,show_hero_metric:`Show next departure large`,show_platform:`Show platform / track`,show_qr_button:`Show QR-code button`,show_stops_ahead:`Show intermediate stops`,show_traffic_info:`Show disruption alerts`,show_type_icon:`Show vehicle-type icon`}},We={editor:{accessibility_only:`Only show step-free departures`,chips:`Extra labels`,date_format:`Date format`,exit:`Exit icon`,extra_icons:`Extra icons`,flicker:`Simulate LED flicker`,header_exit_accessible:`Step-free exit`,header_exit_none:`None`,header_exit_regular:`Exit`,housing:`Show LED cabinet frame`,housing_helper:`Dark bezel around the LED panel with a subtle glass reflection on top.`,icon_mdi_door_open:`Open door`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_stairs:`Stairs`,line_stripe:`Show line stripe`,line_stripe_helper:`A 4 px coloured bar at the left edge of each row, matched to the line.`,message_text:`Message`,message_text_requires:`Requires “Show ticker”.`,message_ticker:`Scrolling message`,message_ticker_helper:`Runs a custom message across the display every 5 minutes.`,platform_side:`Platform side`,platform_side_auto:`Auto (1 = right, 2 = left)`,platform_side_helper:`Default follows Wiener Linien signage (platform 2 on the left, otherwise right). Override manually if needed.`,platform_side_left:`Always left`,platform_side_requires:`Requires “Show platform”.`,platform_side_right:`Always right`,show_clock:`Show clock chip`,show_date:`Show date chip`,show_header:`Show station sign`,show_header_helper:`Master switch. Per-side settings are kept.`,show_line_pill:`Show line badge`,show_line_pill_helper:`Renders the line code as a filled badge in the line colour rather than plain text.`,show_platform:`Show platform`,show_station_name:`Show station name`,show_unit:`Show the “min” unit`,show_unit_helper:`Trail each countdown number with a small amber "min" caption.`,size:`Size`,station_bg:`Station-name background`,station_bg_black:`Black`,station_bg_default:`Default`,station_bg_white:`White`,style:`Style`,style_classic:`Classic`,style_pixel:`Dot matrix`,style_warm:`Warm`,text:`Sign text`,wheelchair_race:`Wheelchair race (easter egg)`},aria_dismiss_message:`Dismiss scrolling message`,aria_start_race:`Start accessibility race`,at_platform:`Arriving`,barrier_free_title:`Step-free access`,betriebsschluss:`End of service`,countdown_minutes:`{n} minutes`,departures_list:`Upcoming departures`,dir_both:`Both`,dir_h:`Outbound`,dir_h_short:`H`,dir_r:`Return`,dir_r_short:`R`,entity_missing:`Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.`,gleis:`PLATF.`,header:{icon_exit:`Exit`,icon_exit_access:`Step-free exit`,icon_wc:`Toilet`,icon_escalator:`Escalator`,icon_elevator:`Elevator`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_door_open:`Open door`,icon_mdi_stairs:`Stairs`},no_data:`No departures`,no_data_wrong_direction:`No departures in this direction`,no_data_wrong_line:`No departures for this line`,no_entity:`No stop selected`,race_finished:`Accessibility race finished`,race_starting_in:`Race starting in {n}`,race_winner_announce:`Wheelchair {n} wins the accessibility race`,stale_feed:`No live data`,steig:`BAY`,unit_min:`min`,version_reload:`Reload`,version_reload_stuck:`Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.`,version_update:`Retro card updated to v{v} — please reload`,via_prefix:`VIA`},Ge={no_entity:`No stop selected`,no_data:`No departures`,no_data_wrong_direction:`No departures in this direction`,no_data_wrong_line:`No departures for this line`,betriebsschluss:`End of service`,stale_feed:`No live data`,dir_h:`Outbound`,dir_r:`Return`,dir_h_short:`H`,dir_r_short:`R`,gleis:`PLATF.`,steig:`BAY`,col_line:`LINE`,col_dest:`DIRECTION`,col_step_free:`STEP-FREE`,col_cd:`ARRIVAL`,version_update:`Flap card updated to v{v} — please reload`,version_reload:`Reload`,version_reload_stuck:`Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.`,entity_missing:`Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.`,departures_list:`Upcoming departures`,at_platform:`Arriving`,countdown_minutes:`{n} minutes`,barrier_free_title:`Step-free access`,not_barrier_free_title:`Step-free access not available`,unit_min:`min`,dir_both:`Both`,header:{icon_exit:`Exit`,icon_exit_access:`Step-free exit`,icon_wc:`Toilet`,icon_escalator:`Escalator`,icon_elevator:`Elevator`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_door_open:`Open door`,icon_mdi_stairs:`Stairs`},editor:{accessibility_only:`Only show step-free departures`,accessibility_only_requires:`Requires “Show wheelchair badge”.`,chips:`Extra labels`,date_format:`Date format`,exit:`Exit icon`,extra_icons:`Extra icons`,header_exit_accessible:`Step-free exit`,header_exit_none:`None`,header_exit_regular:`Exit`,hide_attribution:`Hide data source`,hide_attribution_helper:`When on, the CC-BY credit at the bottom of the card is hidden. The Wiener Linien Open Government Data licence requires visible attribution unless you keep the credit elsewhere on the dashboard.`,housing:`Show cabinet frame`,housing_helper:`Wraps the board in the cabinet with a soft inset bevel and drop shadow. Cabinet colour follows your HA theme (cream on light, dark on dark). When off, the board sits flush against the dashboard.`,icon_mdi_door_open:`Open door`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_stairs:`Stairs`,max_rows:`Number of rows`,max_rows_helper:`How many departures to show on the board (1–8). Merged across all stops, sorted by countdown.`,show_accessibility:`Show step-free tile`,show_accessibility_helper:`Add a wheelchair pictogram tile next to step-free departures.`,show_clock:`Show clock chip`,show_date:`Show date chip`,show_header:`Show station sign`,show_header_helper:`Master switch. Per-side settings are kept.`,show_line_column:`Show line column`,show_line_column_helper:`Shows the column carrying the line code. Turn it off when the board only ever shows one line.`,show_min_unit:`Show "min" caption`,show_min_unit_helper:`Small label next to the countdown number, like real station boards.`,show_platform:`Show platform / track`,show_platform_helper:`Adds a per-row platform tile between the destination and the countdown. Only shown when at least one visible row has a platform value.`,show_station_name:`Show station name`,show_station_name_helper:`Coloured band with the station name and current time at the top of the card.`,size:`Size`,station_bg:`Station-name background`,station_bg_black:`Black`,station_bg_helper:`Default is the colour of the first tracked line (e.g. red for U1, orange for U3). On multi-line boards you can pick a specific line, or override with solid white or black.`,station_bg_line:`First line`,station_bg_white:`White`,text:`Sign text`}},Ke={heading_fallback:`Route`,leave_in:`Leave in`,now:`Now`,minutes:`{n} min`,minutes_long:`{n} minutes`,trip_minutes:`{n} min trip`,direct:`Direct`,changes_one:`1 change`,changes_many:`{n} changes`,platform_track:`Platform {p}`,platform_stop:`Stop {p}`,stops_one:`1 stop`,stops_many:`{n} stops`,walk:`{n} min walk`,towards:`towards {towards}`,late:`{n} min late`,risk_ok:`{n} min to spare`,risk_tight:`Tight: {n} min to spare`,risk_at_risk:`Connection at risk: {n} min short`,transfer_at:`Change at {at}`,alternatives:`More connections ({n})`,disruption:`Disruption`,inactive:`Outside the refresh window`,inactive_detail:`Updates {when}.`,no_trips:`No connection right now`,no_trips_detail:`The trip planner found nothing. The next update tries again.`,unavailable:`Can't reach the trip planner`,unavailable_detail:`Connections come back as soon as it answers.`,no_entity:`No route selected. Pick one in the editor.`,entity_missing:`Sensor {entity} no longer exists. Pick another route in the editor.`,trip_summary:`{dep} to {arr}, {changes}`,version_update:`Route card updated to v{v} — please reload`,version_reload:`Reload`,version_reload_stuck:`Reloading didn't pick up the new version. Close this browser tab and open the dashboard again, or clear the site data for Home Assistant in your browser settings.`,editor:{entity:`Route`,entity_helper:`Only routes you've set up are listed. Start and destination are chosen when you set up the route.`,title:`Heading`,title_helper:`Leave empty for “Start → Destination”.`,alternatives:`More connections`,alternatives_helper:`How many later connections to list under the best one. 0 hides them.`,hide_attribution:`Hide data source`,hide_attribution_helper:`The Wiener Linien OGD licence requires a visible credit unless it appears elsewhere on the dashboard.`,no_routes:`No route set up yet. Start and destination are set in the integration; the route then shows up here.`,add_route:`Set up a route`},not_a_route:`This is a departure board, not a route. Pick a route in the editor.`},qe={common:He,modern:Ue,retro:We,flap:Ge,route:Ke};const Je={de:Pe,en:Ve},Ye=Je.de??{};function Xe(e,t){return e.split(`.`).reduce((e,t)=>{if(e&&typeof e==`object`&&t in e)return e[t]},t)}function Ze(e,t){let n=Xe(e,t);return typeof n==`string`?n:void 0}function Qe(e){return((e.configLanguage||e.hassLanguage||`de`).split(/[-_]/)[0]??`de`)===`en`?`en`:`de`}function G(e,t,n){let r=Qe(t),i=Ze(e,Je[r]??Ye);if(i===void 0&&(i=Ze(e,Ye)),i===void 0)return e;if(n)for(let[e,t]of Object.entries(n))i=i.replace(`{${e}}`,String(t));return i}function $e(e,t,n){let r=t.et(n);return r===n?e?.localize?.(`ui.panel.lovelace.editor.card.generic.${n}`)||n:r}function et(e,t,n){let r=n?.[t];if(r!==void 0)return r;let i=`${t}_helper`,a=e.et(i);return a===i?void 0:a}function tt(e,t){let n={hassLanguage:t};return{t:t=>G(`${e}.${t}`,n),et:t=>{let r=`${e}.editor.${t}`,i=G(r,n);if(i!==r)return i;let a=`common.editor.${t}`,o=G(a,n);return o===a?t:o}}}function nt(e,t,n){e.dispatchEvent(new CustomEvent(t,{detail:n,bubbles:!0,composed:!0}))}const K=`wiener-linien-austria-route-card`;function q(e){if(!e)return[];let t=[];for(let[n,r]of Object.entries(e.states??{})){if(!n.startsWith(`sensor.`))continue;let e=r?.attributes??{};Array.isArray(e.trips)&&typeof e.origin==`string`&&typeof e.destination==`string`&&typeof e.active==`boolean`&&t.push(n)}return t.sort()}function J(e){if(!e||typeof e!=`object`)throw Error(`${K}: config must be an object`);if(e.entity!==void 0&&typeof e.entity!=`string`)throw Error(`${K}: 'entity' must be a string`);if(typeof e.entity==`string`&&e.entity&&!e.entity.startsWith(`sensor.`))throw Error(`${K}: 'entity' must be a sensor`);let t=Number(e.alternatives??2),n=Number.isFinite(t)?Math.min(3,Math.max(0,Math.round(t))):2;return{type:e.type,entity:e.entity??``,title:typeof e.title==`string`?e.title:``,alternatives:n,hide_attribution:e.hide_attribution===!0}}function rt(e,t){if(!e)return null;let n=Date.parse(e);return Number.isFinite(n)?Math.max(0,Math.floor((n-t)/6e4)):null}function Y(e){return e?/T(\d{2}:\d{2})/.exec(e)?.[1]??``:``}function it(e,t){return(Array.isArray(e?.trips)?e.trips:[]).filter(e=>{if(e.cancelled)return!1;let n=e.departure?Date.parse(e.departure):NaN;return!Number.isFinite(n)||n>=t-3e4})}function X(e){return e.legs.filter(e=>!e.walk&&!!e.line)}const at={ok:`mdi:check-circle-outline`,tight:`mdi:clock-alert-outline`,at_risk:`mdi:alert-circle-outline`};function ot(e){return!e?.from||!e.to?``:`${e.from.slice(0,5)}–${e.to.slice(0,5)}`}const st=[`mon`,`tue`,`wed`,`thu`,`fri`,`sat`,`sun`];function ct(e,t){let n=(e?.days??[]).filter(e=>st.includes(e));if(n.length===0||n.length===7)return``;let r=new Intl.DateTimeFormat(t===`en`?`en-GB`:`de-AT`,{weekday:`short`,timeZone:`UTC`}),i=e=>r.format(Date.UTC(2024,0,1+e)),a=st.map((e,t)=>n.includes(e)?t:-1).filter(e=>e>=0),o=[],s=0;for(;s<a.length;){let e=s;for(;e+1<a.length&&a[e+1]===a[e]+1;)e++;let t=a.slice(s,e+1);t.length>=3?o.push(`${i(t[0])}–${i(t[t.length-1])}`):o.push(...t.map(i)),s=e+1}return o.join(`, `)}function Z(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}function lt(e){return[{name:`entity`,required:!0,selector:{entity:{include_entities:e}}},{name:`title`,selector:{text:{}}},{name:`alternatives`,selector:{number:{min:0,max:3,step:1,mode:`slider`}}},{name:`hide_attribution`,selector:{boolean:{}}}]}let Q=class extends V{constructor(...e){super(...e),this._computeLabel=e=>$e(this.hass,this._i18n,e.name),this._computeHelper=e=>et(this._i18n,e.name)}setConfig(e){this._config=J(e)}get _i18n(){return tt(`route`,this.hass?.language)}_onValueChanged(e){if(!this._config)return;let t=e.detail.value,n={...this._config,...t};n.title||delete n.title,n.hide_attribution!==!0&&delete n.hide_attribution,this._config=J(n),nt(this,`config-changed`,{config:n})}render(){if(!this._config)return P;let e=q(this.hass),{et:t}=this._i18n;return M`
      ${e.length===0?M`<ha-alert alert-type="info">
            ${t(`no_routes`)}
            <a slot="action" href=${`/_my_redirect/config_flow_start?domain=wiener_linien_austria`}>${t(`add_route`)}</a>
          </ha-alert>`:P}
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${lt(e)}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._onValueChanged}
      ></ha-form>
    `}};Z([U({attribute:!1})],Q.prototype,`hass`,void 0),Z([W()],Q.prototype,`_config`,void 0),Q=Z([H(`${K}-editor`)],Q);async function ut(e,t,n){if(!e?.callWS)return null;try{let r=await e.callWS({type:t});if(r?.version&&r.version!==n)return r.version}catch{}return null}function dt(e){try{window.caches?.keys?.().then(e=>{e.forEach(e=>window.caches?.delete?.(e))})}catch{}if(e)try{window.sessionStorage?.setItem(`wl-reload-attempted-${e}`,`1`)}catch{}window.location.reload()}function ft(e){if(!e)return!1;try{return window.sessionStorage?.getItem(`wl-reload-attempted-${e}`)===`1`}catch{return!1}}function pt(e,t,n=`banner`){if(!e)return P;if(ft(e)){let e=t(`version_reload_stuck`);return M`
      <div class=${n} role="alert" aria-live="assertive">
        <span>${e}</span>
      </div>
    `}let r=t(`version_update`).replace(`{v}`,e),i=t(`version_reload`);return M`
    <div class=${n} role="alert" aria-live="assertive">
      <span>${r}</span>
      <button
        type="button"
        aria-label=${i}
        @click=${()=>dt(e)}
      >
        ${i}
      </button>
    </div>
  `}function mt(e,t,n={},r=`var(--primary-color)`){let i=e.toUpperCase();if(t[i]!==void 0)return{background:t[i]};if(/^N\d/.test(i))return{background:`#1b1464`,color:`#fef200`};let a=n[e]??n[i];return a?.bg?a.fg?{background:`#${a.bg}`,color:`#${a.fg}`}:{background:`#${a.bg}`}:{background:r}}function ht(e){switch(e){case`ptMetro`:return`mdi:subway-variant`;case`ptTram`:return`mdi:tram`;case`ptBusCity`:case`ptBusNight`:return`mdi:bus`;default:return null}}function gt(e){return e.replace(/[^A-Za-z0-9_]/g,`_`)}{let e=window;e.customCards=e.customCards??[],e.customCards.some(e=>e.type===`wiener-linien-austria-route-card`)||e.customCards.push({type:K,name:`Wiener Linien Austria — Route`,description:`Next connection from A to B, with transfer buffers`,preview:!0,getEntitySuggestion:(e,t)=>!t.startsWith(`sensor.`)||e?.entities?.[t]?.platform!==`wiener_linien_austria`||!q(e).includes(t)?null:{config:{type:`custom:${K}`,entity:t}}})}let $=class extends V{constructor(...e){super(...e),this._versionMismatch=null,this._now=Date.now(),this._alternativesOpen=!1,this._tick=null,this._versionCheckDone=!1}setConfig(e){this._config=J(e)}getCardSize(){return 6}getGridOptions(){return{columns:6,rows:`auto`,min_columns:4,min_rows:4}}static getConfigElement(){return document.createElement(`${K}-editor`)}static getStubConfig(e){let t=q(e)[0];return t?{entity:t}:{}}connectedCallback(){super.connectedCallback(),Ne(),this._now=Date.now(),this._tick=setInterval(()=>{this._now=Date.now()},15e3),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion())}disconnectedCallback(){super.disconnectedCallback(),this._tick!==null&&clearInterval(this._tick),this._tick=null}updated(e){e.has(`hass`)&&!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion())}shouldUpdate(e){if(!this._config)return!1;if(!e.has(`hass`)||e.size>1)return!0;let t=e.get(`hass`),n=this._config.entity;return!t||!n||t.states[n]!==this.hass?.states[n]}async _checkCardVersion(){try{this._versionMismatch=await ut(this.hass,`wiener_linien_austria/route_card_version`,`2.0.0`)}catch(e){console.warn(`[${K}] version probe failed`,e)}}_t(e,t){return G(`route.${e}`,{hassLanguage:this.hass?.language},t)}get _lang(){return(this.hass?.language??`de`).startsWith(`en`)?`en`:`de`}render(){let e=this._config;if(!e)return P;let t=e.entity?this.hass?.states[e.entity]:void 0,n=t?.attributes??{},r=e.title||(n.origin&&n.destination?`${n.origin} → ${n.destination}`:this._t(`heading_fallback`)),i=e.hide_attribution?``:typeof n.attribution==`string`&&n.attribution||`Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0`;return M`
      <ha-card>
        <div class="wrap">
          ${pt(this._versionMismatch,e=>this._t(e))}
          <h2 class="heading">
            <ha-icon icon="mdi:map-marker-path" aria-hidden="true"></ha-icon>
            <span>${r}</span>
          </h2>
          ${this._renderBody(e,t?.state,n)}
          ${i?M`<div class="attribution">${i}</div>`:P}
        </div>
      </ha-card>
    `}_renderBody(e,t,n){if(!e.entity)return this._empty(`mdi:routes`,this._t(`no_entity`));if(t===void 0)return this._empty(`mdi:help-circle-outline`,this._t(`entity_missing`,{entity:e.entity}));if(!q(this.hass).includes(e.entity)&&t!==`unavailable`)return this._empty(`mdi:swap-horizontal`,this._t(`not_a_route`));if(t===`unavailable`)return this._empty(`mdi:cloud-off-outline`,this._t(`unavailable`),this._t(`unavailable_detail`));if(n.active===!1){let e=[ct(n.active_window,this._lang),ot(n.active_window)].filter(Boolean).join(` `);return this._empty(`mdi:sleep`,this._t(`inactive`),e?this._t(`inactive_detail`,{when:e}):void 0)}let r=it(n,this._now),i=r[0];if(!i)return this._empty(`mdi:timetable`,this._t(`no_trips`),this._t(`no_trips_detail`));let a=r.slice(1,1+e.alternatives);return M`
      ${this._renderHero(i)}
      ${this._renderNotices(i,n)}
      ${this._renderStrand(i,n)}
      ${a.length?this._renderAlternatives(a,n):P}
    `}_empty(e,t,n){return M`
      <div class="empty" role="status">
        <ha-icon icon=${e} aria-hidden="true"></ha-icon>
        <p class="empty-title">${t}</p>
        ${n?M`<p class="empty-detail">${n}</p>`:P}
      </div>
    `}_changesText(e){return e.interchanges===0?this._t(`direct`):e.interchanges===1?this._t(`changes_one`):this._t(`changes_many`,{n:e.interchanges})}_tripSummary(e){return this._t(`trip_summary`,{dep:Y(e.departure),arr:Y(e.arrival),changes:this._changesText(e)})}_renderHero(e){let t=rt(e.departure,this._now),n=t===0,r=n?this._t(`now`):this._t(`minutes_long`,{n:t??0}),i=[e.duration_minutes===null?``:this._t(`trip_minutes`,{n:e.duration_minutes}),this._changesText(e)].filter(Boolean).join(`, `);return M`
      <div class="hero">
        <p class="hero-count">
          <span class="hero-label">${this._t(`leave_in`)}</span>
          <span class="hero-metric" aria-hidden="true">
            ${n?this._t(`now`):M`${t??`–`}<span class="hero-unit">min</span>`}
          </span>
          <span class="sr-only">${r}</span>
        </p>
        <div class="hero-meta">
          <p class="hero-times">
            <span aria-hidden="true">${Y(e.departure)} – ${Y(e.arrival)}</span>
            <span class="sr-only">${this._tripSummary(e)}</span>
          </p>
          <p class="hero-sub">${i}</p>
        </div>
      </div>
    `}_renderNotices(e,t){let n=new Set(X(e).map(e=>e.line??``)),r=(t.traffic_info??[]).filter(e=>(e.related_lines??[]).some(e=>n.has(e))).slice(0,2);return r.length?M`
      <ul class="notices">
        ${r.map(e=>M`
            <li class="notice">
              <ha-icon icon="mdi:alert-outline" aria-hidden="true"></ha-icon>
              <span>
                <span class="sr-only">${this._t(`disruption`)}: </span>${e.title??``}
              </span>
            </li>
          `)}
      </ul>
    `:P}_lineStyle(e,t){return mt(e,{},t.line_colors??{})}_renderBadge(e,t){let n=this._lineStyle(e.line??``,t);return M`<span
      class="line-badge"
      style=${je({background:n.background,color:n.color??`#fff`})}
      >${e.line}</span
    >`}_platformText(e){let t=e.origin.platform;if(!t)return``;let n=e.type===`ptMetro`||e.type?.startsWith(`ptTrain`);return this._t(n?`platform_track`:`platform_stop`,{p:t})}_renderStrand(e,t){let n=X(e),r=n[n.length-1];return M`
      <ol class="strand">
        ${n.map((r,i)=>{let a=this._lineStyle(r.line??``,t).background,o=e.transfers[i];return M`
            ${this._renderLeg(r,a,i===0,t)}
            ${o&&i<n.length-1?this._renderTransfer(o):P}
          `})}
        ${r?M`
              <li class="stop stop--end">
                <span class="node node--end" aria-hidden="true"></span>
                <time datetime=${r.destination.estimated??r.destination.planned??``}
                  >${Y(r.destination.estimated??r.destination.planned)}</time
                >
                <span class="stop-name">${r.destination.name}</span>
              </li>
            `:P}
      </ol>
    `}_renderLeg(e,t,n,r){let i=e.origin.estimated??e.origin.planned,a=e.origin.delay_minutes??0,o=ht(e.type??void 0),s=e.stop_count===1?this._t(`stops_one`):this._t(`stops_many`,{n:e.stop_count}),c=this._platformText(e);return M`
      <li class="leg" style=${je({"--leg-colour":t})}>
        <div class="stop">
          <span class=${n?`node node--start`:`node`} aria-hidden="true"></span>
          <time datetime=${i??``}>${Y(i)}</time>
          <span class="stop-name">${e.origin.name}</span>
          ${c?M`<span class="platform">${c}</span>`:P}
        </div>
        <div class="ride">
          ${this._renderBadge(e,r)}
          ${o?M`<ha-icon class="type-icon" icon=${o} aria-hidden="true"></ha-icon>`:P}
          <span class="towards">
            ${e.towards?this._t(`towards`,{towards:e.towards}):``}
          </span>
          <span class="ride-meta">${s}</span>
          ${a>0?M`<span class="late">
                <ha-icon icon="mdi:clock-alert-outline" aria-hidden="true"></ha-icon>
                ${this._t(`late`,{n:a})}
              </span>`:P}
        </div>
      </li>
    `}_riskText(e){switch(e.risk){case`at_risk`:return this._t(`risk_at_risk`,{n:Math.abs(e.slack_minutes)});case`tight`:return this._t(`risk_tight`,{n:e.slack_minutes});default:return this._t(`risk_ok`,{n:e.slack_minutes})}}_renderRisk(e){return M`
      <span class="risk" data-risk=${e.risk}>
        <ha-icon icon=${at[e.risk]} aria-hidden="true"></ha-icon>
        <span>${this._riskText(e)}</span>
      </span>
    `}_renderTransfer(e){return M`
      <li class="transfer" data-risk=${e.risk}>
        <span class="node node--transfer" aria-hidden="true"></span>
        <span class="transfer-at">${this._t(`transfer_at`,{at:e.at})}</span>
        ${e.walk_minutes>0?M`<span class="walk">
              <ha-icon icon="mdi:walk" aria-hidden="true"></ha-icon>
              ${this._t(`walk`,{n:e.walk_minutes})}
            </span>`:P}
        ${this._renderRisk(e)}
      </li>
    `}_renderAlternatives(e,t){let n=gt(`route-alt-${this._config?.entity??``}`);return M`
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
    `}_renderAlternative(e,t){let n=e.transfers.reduce((e,t)=>e===void 0||t.slack_minutes<e.slack_minutes?t:e,void 0);return M`
      <li class="alt">
        <span class="alt-times">
          <span aria-hidden="true">${Y(e.departure)} – ${Y(e.arrival)}</span>
          <span class="sr-only">${this._tripSummary(e)}</span>
        </span>
        <span class="alt-lines">
          ${X(e).map(e=>this._renderBadge(e,t))}
        </span>
        <span class="alt-meta">
          ${e.duration_minutes===null?``:this._t(`minutes`,{n:e.duration_minutes})}
        </span>
        ${n?this._renderRisk(n):P}
      </li>
    `}static{this.styles=c`:host {
color-scheme: light dark;
display: block;
container-type: inline-size;
--wl-rt: var(--success-color, #43a047);
--wl-warning: var(--warning-color, #ffa000);
--wl-error: var(--error-color, #db4437);
--wl-radius-sm: var(--ha-border-radius-sm, 4px);
--wl-radius-md: var(--ha-border-radius-md, 8px);
--wl-pad-x: var(--ha-space-4, 16px);
--wl-pad-y: var(--ha-space-3, 12px);
--wl-row-gap: var(--ha-space-3, 12px);
--wl-metric-size: 2.25rem;
--strand-width: 4px;
--node-size: 12px;
--strand-x: 6px;
--leg-colour: var(--primary-color);
}
ha-card {
overflow: hidden;
font-family: "WL Sans", var(--ha-font-family-body, system-ui), sans-serif;
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
.heading {
display: flex;
align-items: center;
gap: 8px;
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
top: 10px;
bottom: -10px;
width: var(--strand-width);
border-radius: 2px;
background: var(--leg-colour);
}
.transfer::before {
content: "";
position: absolute;
inset-inline-start: calc(var(--strand-x) + var(--node-size) / 2 - 1px);
top: 0;
bottom: 0;
border-inline-start: 2px dotted var(--secondary-text-color);
}
.node {
position: absolute;
inset-inline-start: var(--strand-x);
top: 5px;
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
min-height: 22px;
}
.stop time {
font-weight: 700;
color: var(--primary-text-color);
}
.stop-name {
font-weight: 600;
color: var(--primary-text-color);
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
padding-block: 6px 12px;
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
.late {
display: inline-flex;
align-items: center;
gap: 2px;
font-weight: 600;
color: var(--primary-text-color);
}
.late ha-icon {
--mdc-icon-size: 16px;
color: var(--wl-error);
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
.walk {
display: inline-flex;
align-items: center;
gap: 2px;
}
.walk ha-icon {
--mdc-icon-size: 16px;
}
.stop--end {
display: flex;
flex-wrap: wrap;
align-items: baseline;
gap: 2px 8px;
}
.risk {
--risk: var(--wl-rt);
display: inline-flex;
align-items: center;
gap: 4px;
padding: 2px 8px 2px 10px;
border-radius: var(--wl-radius-sm);
background: color-mix(in srgb, var(--risk) 16%, transparent);
box-shadow: inset 3px 0 0 var(--risk);
color: var(--primary-text-color);
font-size: 0.8rem;
font-weight: 600;
}
.risk[data-risk="tight"] {
--risk: var(--wl-warning);
}
.risk[data-risk="at_risk"] {
--risk: var(--wl-error);
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
background: color-mix(in srgb, var(--wl-warning) 16%, transparent);
box-shadow: inset 3px 0 0 var(--wl-warning);
color: var(--primary-text-color);
font-size: 0.85rem;
}
.notice ha-icon {
--mdc-icon-size: 18px;
flex: none;
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
display: flex;
flex-wrap: wrap;
align-items: center;
gap: 6px 10px;
padding-block: 8px;
border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
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
.banner {
display: flex;
align-items: center;
gap: 10px;
padding: 10px 12px;
border-radius: var(--wl-radius-md);
background: color-mix(in srgb, var(--wl-warning) 16%, transparent);
color: var(--primary-text-color);
font-size: 0.85rem;
}
.banner > span {
flex: 1;
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
.alt-toggle:focus-visible,
button:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
border-radius: 6px;
}
@media (forced-colors: active) {
.line-badge,
.risk,
.notice {
outline: 1px solid CanvasText;
}
.leg::before,
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
}`}};Z([U({attribute:!1})],$.prototype,`hass`,void 0),Z([W()],$.prototype,`_config`,void 0),Z([W()],$.prototype,`_versionMismatch`,void 0),Z([W()],$.prototype,`_now`,void 0),Z([W()],$.prototype,`_alternativesOpen`,void 0),$=Z([H(K)],$);export{$ as WienerLinienAustriaRouteCard};
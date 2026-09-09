/*! Wiener Linien Austria — bundled by Rolldown. Edit sources in src/, then `npm run build`. */
var e=Object.defineProperty,t=(t,n)=>{let r={};for(var i in t)e(r,i,{get:t[i],enumerable:!0});return n||e(r,Symbol.toStringTag,{value:`Module`}),r};
/**
* @license
* Copyright 2019 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const n=globalThis,r=n.ShadowRoot&&(n.ShadyCSS===void 0||n.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,i=Symbol(),a=new WeakMap;var o=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(r&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=a.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&a.set(t,e))}return e}toString(){return this.cssText}};const s=e=>new o(typeof e==`string`?e:e+``,void 0,i),c=(e,...t)=>new o(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,i),l=(e,t)=>{if(r)e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let r of t){let t=document.createElement(`style`),i=n.litNonce;i!==void 0&&t.setAttribute(`nonce`,i),t.textContent=r.cssText,e.appendChild(t)}},u=r?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return s(t)})(e):e,{is:d,defineProperty:f,getOwnPropertyDescriptor:p,getOwnPropertyNames:m,getOwnPropertySymbols:h,getPrototypeOf:g}=Object,_=globalThis,v=_.trustedTypes,y=v?v.emptyScript:``,b=_.reactiveElementPolyfillSupport,x=(e,t)=>e,S={toAttribute(e,t){
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
switch(t){case Boolean:e=e?y:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},C=(e,t)=>!d(e,t),ee={attribute:!0,type:String,converter:S,reflect:!1,useDefault:!1,hasChanged:C};Symbol.metadata??=Symbol(`metadata`),_.litPropertyMetadata??=new WeakMap;var w=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ee){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&f(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=p(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ee}static _$Ei(){if(this.hasOwnProperty(x(`elementProperties`)))return;let e=g(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(x(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(x(`properties`))){let e=this.properties,t=[...m(e),...h(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(u(e))}else e!==void 0&&t.push(u(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return l(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?S:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?S:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??C)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};w.elementStyles=[],w.shadowRootOptions={mode:`open`},w[x(`elementProperties`)]=new Map,w[x(`finalized`)]=new Map,b?.({ReactiveElement:w}),(_.reactiveElementVersions??=[]).push(`2.1.2`);
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const T=globalThis,te=e=>e,E=T.trustedTypes,ne=E?E.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,D=`$lit$`,O=`lit$${Math.random().toFixed(9).slice(2)}$`,k=`?`+O,re=`<${k}>`,A=document,j=()=>A.createComment(``),M=e=>e===null||typeof e!=`object`&&typeof e!=`function`,ie=Array.isArray,ae=e=>ie(e)||typeof e?.[Symbol.iterator]==`function`,oe=`[ 	
\f\r]`,N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,se=/-->/g,ce=/>/g,P=RegExp(`>|${oe}(?:([^\\s"'>=/]+)(${oe}*=${oe}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),le=/'/g,ue=/"/g,de=/^(?:script|style|textarea|title)$/i,fe=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),F=fe(1),pe=fe(2),I=Symbol.for(`lit-noChange`),L=Symbol.for(`lit-nothing`),me=new WeakMap,R=A.createTreeWalker(A,129);function he(e,t){if(!ie(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return ne===void 0?t:ne.createHTML(t)}const ge=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=N;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===N?c[1]===`!--`?o=se:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=P):(de.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=P):o=ce:o===P?c[0]===`>`?(o=i??N,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?P:c[3]===`"`?ue:le):o===ue||o===le?o=P:o===se||o===ce?o=N:(o=P,i=void 0);let d=o===P&&e[t+1].startsWith(`/>`)?` `:``;a+=o===N?n+re:l>=0?(r.push(s),n.slice(0,l)+D+n.slice(l)+O+d):n+O+(l===-2?t:d)}return[he(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]};var _e=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=ge(t,n);if(this.el=e.createElement(l,r),R.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=R.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(D)){let t=u[o++],n=i.getAttribute(e).split(O),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?be:r[1]===`?`?xe:r[1]===`@`?Se:B}),i.removeAttribute(e)}else e.startsWith(O)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(de.test(i.tagName)){let e=i.textContent.split(O),t=e.length-1;if(t>0){i.textContent=E?E.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],j()),R.nextNode(),c.push({type:2,index:++a});i.append(e[t],j())}}}else if(i.nodeType===8){if(i.data===k)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(O,e+1))!==-1;)c.push({type:7,index:a}),e+=O.length-1}}a++}}static createElement(e,t){let n=A.createElement(`template`);return n.innerHTML=e,n}};function z(e,t,n=e,r){if(t===I)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=M(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=z(e,i._$AS(e,t.values),i,r)),t}var ve=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??A).importNode(t,!0);R.currentNode=r;let i=R.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new ye(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Ce(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=R.nextNode(),a++)}return R.currentNode=A,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},ye=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=L,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=z(this,e,t),M(e)?e===L||e==null||e===``?(this._$AH!==L&&this._$AR(),this._$AH=L):e!==this._$AH&&e!==I&&this._(e):e._$litType$===void 0?e.nodeType===void 0?ae(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==L&&M(this._$AH)?this._$AA.nextSibling.data=e:this.T(A.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=_e.createElement(he(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new ve(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=me.get(e.strings);return t===void 0&&me.set(e.strings,t=new _e(e)),t}k(t){ie(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(j()),this.O(j()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=te(e).nextSibling;te(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},B=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=L,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=L}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=z(this,e,t,0),a=!M(e)||e!==this._$AH&&e!==I,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=z(this,r[n+o],t,o),s===I&&(s=this._$AH[o]),a||=!M(s)||s!==this._$AH[o],s===L?e=L:e!==L&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===L?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},be=class extends B{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===L?void 0:e}},xe=class extends B{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==L)}},Se=class extends B{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=z(this,e,t,0)??L)===I)return;let n=this._$AH,r=e===L&&n!==L||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==L&&(n===L||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ce=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){z(this,e)}};const we={M:D,P:O,A:k,C:1,L:ge,R:ve,D:ae,V:z,I:ye,H:B,N:xe,U:Se,B:be,F:Ce},Te=T.litHtmlPolyfillSupport;Te?.(_e,ye),(T.litHtmlVersions??=[]).push(`3.3.2`);const Ee=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new ye(t.insertBefore(j(),e),e,void 0,n??{})}return i._$AI(e),i},De=globalThis
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
;var V=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ee(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};V._$litElement$=!0,V.finalized=!0,De.litElementHydrateSupport?.({LitElement:V});const Oe=De.litElementPolyfillSupport;Oe?.({LitElement:V}),(De.litElementVersions??=[]).push(`4.2.2`);
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const ke=e=>(t,n)=>{n===void 0?customElements.define(e,t):n.addInitializer(()=>{customElements.define(e,t)})},Ae={attribute:!0,type:String,converter:S,reflect:!1,hasChanged:C},je=(e=Ae,t,n)=>{
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function Me(e){return(t,n)=>typeof n==`object`?je(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/function H(e){return Me({...e,state:!0,attribute:!1})}
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const U={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Ne=e=>(...t)=>({_$litDirective$:e,values:t});var Pe=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};
/**
* @license
* Copyright 2018 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/const W=Ne(class extends Pe{constructor(e){if(super(e),e.type!==U.ATTRIBUTE||e.name!==`class`||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return` `+Object.keys(e).filter(t=>e[t]).join(` `)+` `}update(e,[t]){if(this.st===void 0){this.st=new Set,e.strings!==void 0&&(this.nt=new Set(e.strings.join(` `).split(/\s/).filter(e=>e!==``)));for(let e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}let n=e.element.classList;for(let e of this.st)e in t||(n.remove(e),this.st.delete(e));for(let e in t){let r=!!t[e];r===this.st.has(e)||this.nt?.has(e)||(r?(n.add(e),this.st.add(e)):(n.remove(e),this.st.delete(e)))}return I}}),{I:Fe}=we,Ie=e=>e.strings===void 0,Le={},Re=(e,t=Le)=>e._$AH=t,ze=Ne(class extends Pe{constructor(){
/**
* @license
* Copyright 2020 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
/**
* @license
* Copyright 2021 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
super(...arguments),this.key=L}render(e,t){return this.key=e,t}update(e,[t,n]){return t!==this.key&&(Re(e),this.key=t),n}}),G=Ne(class extends Pe{constructor(e){
/**
* @license
* Copyright 2018 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
if(super(e),e.type!==U.ATTRIBUTE||e.name!==`style`||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{let r=e[n];return r==null?t:t+`${n=n.includes(`-`)?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,`-$&`).toLowerCase()}:${r};`},``)}update(e,[t]){let{style:n}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let e of this.ft)t[e]??(this.ft.delete(e),e.includes(`-`)?n.removeProperty(e):n[e]=null);for(let e in t){let r=t[e];if(r!=null){this.ft.add(e);let t=typeof r==`string`&&r.endsWith(` !important`);e.includes(`-`)||t?n.setProperty(e,t?r.slice(0,-11):r,t?`important`:``):n[e]=r}}return I}});function Be(e,t){return e?F`<span lang="de">${e}</span>`:t??``}function Ve(e,t,n){e.dispatchEvent(new CustomEvent(t,{detail:n,bubbles:!0,composed:!0}))}var He=t({common:()=>Ue,default:()=>qe,flap:()=>Ke,modern:()=>We,retro:()=>Ge}),Ue={editor:{add_chip:`Chip hinzufügen`,add_icon:`Symbol hinzufügen`,date_format_placeholder:`d.m.Y`,direction_label:`Fahrtrichtung`,direction_not_served:`nicht bedient`,direction_note_one_way:`Rückfahrt deaktiviert: {line} endet hier.`,direction_unavailable:`Keine Abfahrten in dieser Richtung`,entities:`Haltestellen`,entity:`Haltestelle`,header_amenities:`Symbole in diesem Slot`,header_bar_aria:`Stationsanzeige — Seite wählen`,header_chips_and_icons:`Textchips (max. {chips}) und Extra-Symbole (max. {icons})`,header_left:`Linke Seite`,header_pick_side_hint:`Seite antippen, dann unten füllen`,header_right:`Rechte Seite`,header_side_aria:`Seite der Stationsanzeige`,header_slot_empty:`leer`,line_active_aria:`Linie {line} aktiv`,line_inactive_aria:`Linie {line} inaktiv`,lines_empty_means_all:`leer = alle Linien`,lines_label:`Linien an dieser Haltestelle`,lines_selected:`{n} von {total}`,no_lines_hint:`Die Linien erscheinen, sobald diese Haltestelle Abfahrten meldet.`,no_lines_title:`Noch keine Linien verfügbar`,per_line_direction_aria:`Linie {line}: {direction}`,remove_chip_aria:`Chip {chip} entfernen`,remove_icon_aria:`Symbol {icon} entfernen`,remove_stop:`Haltestelle entfernen`,section_board:`Fallblatt-Tafel`,section_departure_row:`Abfahrtszeile`,section_extras:`Extras`,section_extras_hint:`optional`,section_footer:`Fußzeile`,section_header:`Stationsanzeige`,section_header_hint:`Direkt am Balken`,section_led_panel:`LED-Anzeige`,section_station:`Stationsband`,section_walk_time:`Gehzeit zur Haltestelle`,show_clock_short:`Uhr`,show_date_short:`Datum`,show_elevator_short:`Lift`,show_escalator_short:`Rolltreppe`,show_wc_short:`WC`,size_medium:`Mittel`,size_regular:`Standard`,size_small:`Klein`,tab_display:`Anzeige`,tab_stop:`Haltestelle`,tab_stops:`Haltestellen`,tab_tweaks:`Stil`,text_placeholder:`z. B. Name der nächsten Station`,walk_time_aria:`Gehzeit in Minuten für Linie {line} Richtung {towards}`,walk_time_branching_hint:`Gilt für alle Endstationen in dieser Richtung`,walk_time_hint:`Blendet Abfahrten aus, die ohne dich abfahren würden. Leer = kein Filter.`,walk_time_less_aria:`Gehzeit für Linie {line} verringern`,walk_time_more_aria:`Gehzeit für Linie {line} erhöhen`,walk_time_placeholder:`–`,walk_time_unit:`Minuten`}},We={no_data:`Keine Abfahrten verfügbar`,betriebsschluss:`Betriebsschluss`,stale_feed:`Keine aktuellen Daten`,stale_feed_detail:`Die Wiener Linien melden für diese Haltestelle veraltete Abfahrtszeiten. Sobald wieder Echtzeitdaten kommen, füllt sich die Anzeige automatisch.`,stale_feed_since:`Letzte gemeldete Abfahrt: {time}`,stale_feed_partial:`Einzelne Linien melden keine aktuellen Zeiten.`,min:`Min`,now:`Jetzt`,platform_short_rail:`Gleis`,platform_short_bus:`Steig`,version_update:`Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.`,entity_missing:`Sensor {entity} existiert nicht mehr. Wähle einen anderen Sensor oder entferne ihn aus den Haltestellen dieser Karte.`,no_entities_picked:`Keine Haltestelle ausgewählt`,no_entities_available:`Keine Wiener-Linien-Sensoren gefunden`,departures_list:`Kommende Abfahrten`,barrier_free_title:`Barrierefrei zugänglich`,cooling_title:`Klimatisiert`,disturbance_title:`Verkehrsbehinderung gemeldet`,stops_ahead_aria_show:`Streckenverlauf für {line} Richtung {towards} anzeigen`,stops_ahead_aria_hide:`Streckenverlauf für {line} Richtung {towards} ausblenden`,stops_ahead_other_show:`{count} weitere Linien bei {stop} anzeigen`,stops_ahead_other_hide:`Weitere Linien bei {stop} ausblenden`,dir_h:`Hinfahrt`,dir_r:`Rückfahrt`,dir_h_short:`H`,dir_r_short:`R`,dir_both:`Beide`,traffic_label:`Störung`,traffic_until:`Bis`,traffic_updated:`aktualisiert`,elevator_until:`Bis`,open_in_maps:`In Karte öffnen`,qr_open:`QR-Code anzeigen`,qr_dialog_title:`QR-Code für Haltestelle`,qr_dialog_hint:`Mit dem Smartphone scannen — öffnet die Haltestelle in der Karten-App.`,qr_dialog_close:`QR-Code schließen`,delay_singular:`1 Min. verspätet`,delay_plural:`{n} Min. verspätet`,devmode_title:`DEV`,devmode_traffic_btn:`Störung testen`,devmode_elevator_btn:`Aufzug testen`,devmode_colors_btn:`Linienfarben`,devmode_clear_btn:`Löschen`,editor:{accessibility_only:`Nur barrierefreie Abfahrten anzeigen`,accessibility_only_requires:`Braucht „Barrierefrei-Symbol anzeigen“.`,colors_empty_hint:`Wähle im ersten Reiter Haltestellen aus — ihre Linien erscheinen dann hier.`,colors_hint:`Optional. Ohne Überschreibung gilt die offizielle Linienfarbe.`,hide_attribution:`Datenquelle ausblenden`,hide_attribution_helper:`Wenn aktiv, wird die Quellenangabe ausgeblendet.`,hide_header:`Kopfzeile ausblenden`,hide_header_helper:`Wenn aktiv, wird die Titelleiste der Karte ausgeblendet.`,layout:`Layout mehrerer Haltestellen`,layout_requires:`Wirkt erst ab zwei Haltestellen.`,layout_stacked:`Gestapelt`,layout_tabs:`Reiter`,max_departures:`Anzahl Abfahrten pro Haltestelle`,pick_color_for_line:`Farbe für Linie {line} wählen`,reset_color:`Auf Standard zurücksetzen`,reset_color_aria:`Linienfarbe {line} auf Standard zurücksetzen`,section_colors:`Linienfarben`,section_colors_hint:`überschreibt API-Farbe`,section_departure_row_hint:`pro Zeile`,section_disruptions:`Störungen & Verspätungen`,section_layout:`Aufbau`,section_layout_hint:`Struktur`,show_accessibility:`Barrierefrei-Symbol anzeigen`,show_cooling:`Klimaanlagen-Symbol anzeigen`,show_cooling_helper:`Zeigt eine Schneeflocke neben Abfahrten mit klimatisiertem Fahrzeug. Wiener Linien melden das pro Fahrzeug — ältere Garnituren liefern die Angabe nicht.`,show_delay:`Verspätungen anzeigen`,show_delay_colors:`Verspätungen farblich hervorheben`,show_delay_colors_helper:`Färbt die Minutenzahl rot, wenn eine Abfahrt verspätet ist, und grün, wenn sie zu früh kommt.`,show_delay_colors_requires:`Braucht „Verspätungen anzeigen“.`,show_departures:`Abfahrtsliste anzeigen`,show_elevator_info:`Aufzugsausfälle anzeigen`,show_hero_metric:`Nächste Abfahrt groß anzeigen`,show_platform:`Gleis/Steig anzeigen`,show_qr_button:`QR-Code-Schaltfläche anzeigen`,show_stops_ahead:`Zwischenstationen anzeigen`,show_traffic_info:`Störungen anzeigen`,show_type_icon:`Verkehrsmittel-Symbol anzeigen`}},Ge={editor:{accessibility_only:`Nur barrierefreie Abfahrten anzeigen`,chips:`Zusätzliche Beschriftungen`,date_format:`Datumsformat`,exit:`Ausgangssymbol`,extra_icons:`Zusätzliche Symbole`,flicker:`LED-Flackern simulieren`,header_exit_accessible:`Stufenloser Ausgang`,header_exit_none:`Kein`,header_exit_regular:`Ausgang`,housing:`LED-Gehäuserahmen anzeigen`,housing_helper:`Dunkler Rahmen um die LED-Anzeige mit dezentem Glas-Reflex obenauf.`,icon_mdi_door_open:`Offene Tür`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_stairs:`Treppe`,line_stripe:`Seitlichen Linienstreifen anzeigen`,line_stripe_helper:`4-Pixel-Balken am linken Rand jeder Zeile in der Linienfarbe.`,message_text:`Nachricht`,message_text_requires:`Braucht „Lauftext anzeigen“.`,message_ticker:`Laufschrift`,message_ticker_helper:`Zeigt alle 5 Minuten eine eigene Nachricht als Laufschrift über die Anzeige.`,platform_side:`Gleis/Steig-Seite`,platform_side_auto:`Automatisch (1 = rechts, 2 = links)`,platform_side_helper:`Standard folgt der Wiener-Linien-Beschilderung (Gleis 2 links, sonst rechts). Manuell überschreibbar.`,platform_side_left:`Immer links`,platform_side_requires:`Braucht „Steig anzeigen“.`,platform_side_right:`Immer rechts`,show_clock:`Uhr-Plakette anzeigen`,show_date:`Datums-Plakette anzeigen`,show_header:`Stationsanzeige anzeigen`,show_header_helper:`Hauptschalter. Einstellungen pro Seite bleiben gespeichert.`,show_line_pill:`Linien-Plakette anzeigen`,show_line_pill_helper:`Liniencode als gefüllte Plakette in der Linienfarbe statt als schlichter Text.`,show_platform:`Steig anzeigen`,show_station_name:`Stationsnamen anzeigen`,show_unit:`Einheit „min“ anzeigen`,show_unit_helper:`Kleines „min“ in Amber-Versalien nach jeder Minutenzahl.`,size:`Größe`,station_bg:`Stationsschild-Hintergrund`,station_bg_black:`Schwarz`,station_bg_default:`Standard`,station_bg_white:`Weiß`,style:`Stil`,style_classic:`Klassisch`,style_pixel:`Punktmatrix`,style_warm:`Warm`,text:`Beschriftung`,wheelchair_race:`Rollstuhl-Rennen (Easter Egg)`},aria_dismiss_message:`Lauftext schließen`,aria_start_race:`Barrierefreiheits-Rennen starten`,at_platform:`Einfahrt`,barrier_free_title:`Barrierefrei zugänglich`,betriebsschluss:`Betriebsschluss`,countdown_minutes:`{n} Minuten`,departures_list:`Kommende Abfahrten`,dir_both:`Beide`,dir_h:`Hinfahrt`,dir_h_short:`H`,dir_r:`Rückfahrt`,dir_r_short:`R`,entity_missing:`Sensor {entity} existiert nicht mehr. Wähle oben einen anderen Sensor.`,gleis:`GLEIS`,header:{icon_exit:`Ausgang`,icon_exit_access:`Stufenloser Ausgang`,icon_wc:`WC`,icon_escalator:`Rolltreppe`,icon_elevator:`Aufzug`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_door_open:`Offene Tür`,icon_mdi_stairs:`Treppe`},no_data:`Keine Abfahrten`,no_data_wrong_direction:`Keine Abfahrten in dieser Richtung`,no_data_wrong_line:`Keine Abfahrten für diese Linie`,no_entity:`Keine Haltestelle ausgewählt`,race_finished:`Barrierefreiheits-Rennen beendet`,race_starting_in:`Rennen startet in {n}`,race_winner_announce:`Rollstuhl {n} gewinnt das Barrierefreiheits-Rennen`,stale_feed:`Keine aktuellen Daten`,steig:`STEIG`,unit_min:`min`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.`,version_update:`Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden`,via_prefix:`ÜBER`},Ke={no_entity:`Keine Haltestelle ausgewählt`,no_data:`Keine Abfahrten`,no_data_wrong_direction:`Keine Abfahrten in dieser Richtung`,no_data_wrong_line:`Keine Abfahrten für diese Linie`,betriebsschluss:`Betriebsschluss`,stale_feed:`Keine aktuellen Daten`,dir_h:`Hinfahrt`,dir_r:`Rückfahrt`,dir_h_short:`H`,dir_r_short:`R`,gleis:`GLEIS`,steig:`STEIG`,col_line:`LINIE`,col_dest:`RICHTUNG`,col_step_free:`STUFENLOS`,col_cd:`ANKUNFT`,version_update:`Klappanzeige wurde auf v{v} aktualisiert — bitte neu laden`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.`,entity_missing:`Sensor {entity} existiert nicht mehr. Wähle oben einen anderen Sensor.`,departures_list:`Kommende Abfahrten`,at_platform:`Einfahrt`,countdown_minutes:`{n} Minuten`,barrier_free_title:`Barrierefrei zugänglich`,not_barrier_free_title:`Nicht barrierefrei`,unit_min:`min`,dir_both:`Beide`,header:{icon_exit:`Ausgang`,icon_exit_access:`Stufenloser Ausgang`,icon_wc:`WC`,icon_escalator:`Rolltreppe`,icon_elevator:`Aufzug`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_door_open:`Offene Tür`,icon_mdi_stairs:`Treppe`},editor:{accessibility_only:`Nur barrierefreie Abfahrten anzeigen`,accessibility_only_requires:`Braucht „Rollstuhl-Plakette anzeigen“.`,chips:`Zusätzliche Beschriftungen`,date_format:`Datumsformat`,exit:`Ausgangssymbol`,extra_icons:`Zusätzliche Symbole`,header_exit_accessible:`Stufenloser Ausgang`,header_exit_none:`Kein`,header_exit_regular:`Ausgang`,hide_attribution:`Datenquelle ausblenden`,hide_attribution_helper:`Wenn aktiv, wird die CC-BY-Quellenangabe am unteren Rand der Karte ausgeblendet. Die OGD-Lizenz der Wiener Linien verlangt eine sichtbare Quellenangabe, sofern der Hinweis nicht an anderer Stelle im Dashboard erscheint.`,housing:`Gehäuserahmen anzeigen`,housing_helper:`Umrahmt die Tafel mit dem Gehäuse inkl. dezenter Innenkante und Schlagschatten. Gehäusefarbe folgt dem HA-Theme (cremefarben im Hellmodus, dunkel im Dunkelmodus). Aus = Tafel sitzt bündig auf dem Dashboard.`,icon_mdi_door_open:`Offene Tür`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_stairs:`Treppe`,max_rows:`Anzahl Zeilen`,max_rows_helper:`Wie viele Abfahrten die Tafel zeigt (1–8). Über alle Haltestellen zusammengeführt, nach Abfahrtszeit sortiert.`,show_accessibility:`Rollstuhl-Plakette anzeigen`,show_accessibility_helper:`Zeigt eine Rollstuhl-Plakette neben barrierefreien Abfahrten.`,show_clock:`Uhr-Plakette anzeigen`,show_date:`Datums-Plakette anzeigen`,show_header:`Stationsanzeige anzeigen`,show_header_helper:`Hauptschalter. Einstellungen pro Seite bleiben gespeichert.`,show_line_column:`Linienspalte anzeigen`,show_line_column_helper:`Zeigt die Spalte mit dem Liniencode. Ausschalten, wenn die Tafel ohnehin nur eine Linie zeigt.`,show_min_unit:`Einheit „min“ anzeigen`,show_min_unit_helper:`Kleines „min“ neben der Minutenzahl, wie auf echten Stationstafeln.`,show_platform:`Gleis/Steig anzeigen`,show_platform_helper:`Fügt jeder Zeile eine eigene Gleis-Plakette zwischen Ziel und Minutenzahl hinzu. Wird nur eingeblendet, wenn mindestens eine sichtbare Zeile einen Gleis-Wert hat.`,show_station_name:`Stationsnamen anzeigen`,show_station_name_helper:`Farbiges Band mit Stationsname und Uhrzeit am oberen Rand der Karte.`,size:`Größe`,station_bg:`Hintergrund Stationsschild`,station_bg_black:`Schwarz`,station_bg_helper:`Standard ist die Farbe der ersten erfassten Linie (z. B. Rot für U1, Orange für U3). Bei mehreren Linien kann eine bestimmte Linie gewählt oder auf Weiß bzw. Schwarz umgestellt werden.`,station_bg_line:`Erste Linie`,station_bg_white:`Weiß`,text:`Beschriftung`}},qe={common:Ue,modern:We,retro:Ge,flap:Ke},Je=t({common:()=>Ye,default:()=>$e,flap:()=>Qe,modern:()=>Xe,retro:()=>Ze}),Ye={editor:{add_chip:`Add chip`,add_icon:`Add icon`,date_format_placeholder:`d.m.Y`,direction_label:`Direction`,direction_not_served:`not served`,direction_note_one_way:`Return direction disabled: {line} terminates here.`,direction_unavailable:`No departures in this direction`,entities:`Stops`,entity:`Stop`,header_amenities:`Icons in this slot`,header_bar_aria:`Station sign — choose a side`,header_chips_and_icons:`Text chips (max. {chips}) and extra icons (max. {icons})`,header_left:`Left side`,header_pick_side_hint:`Tap a side, then fill it in below`,header_right:`Right side`,header_side_aria:`Station sign side`,header_slot_empty:`empty`,line_active_aria:`Line {line} active`,line_inactive_aria:`Line {line} inactive`,lines_empty_means_all:`empty = all lines`,lines_label:`Lines at this stop`,lines_selected:`{n} of {total}`,no_lines_hint:`Lines appear as soon as this stop reports departures.`,no_lines_title:`No lines yet`,per_line_direction_aria:`Line {line}: {direction}`,remove_chip_aria:`Remove chip {chip}`,remove_icon_aria:`Remove icon {icon}`,remove_stop:`Remove stop`,section_board:`Split-flap board`,section_departure_row:`Departure row`,section_extras:`Extras`,section_extras_hint:`optional`,section_footer:`Footer`,section_header:`Station sign`,section_header_hint:`Edit on the bar`,section_led_panel:`LED panel`,section_station:`Station band`,section_walk_time:`Walking time to the stop`,show_clock_short:`Clock`,show_date_short:`Date`,show_elevator_short:`Elevator`,show_escalator_short:`Escalator`,show_wc_short:`WC`,size_medium:`Medium`,size_regular:`Standard`,size_small:`Small`,tab_display:`Display`,tab_stop:`Stop`,tab_stops:`Stops`,tab_tweaks:`Style`,text_placeholder:`e.g. name of the next station`,walk_time_aria:`Walking time in minutes for line {line} towards {towards}`,walk_time_branching_hint:`Applies to every terminus in this direction`,walk_time_hint:`Hides departures that would leave without you. Empty = no filter.`,walk_time_less_aria:`Decrease walking time for line {line}`,walk_time_more_aria:`Increase walking time for line {line}`,walk_time_placeholder:`–`,walk_time_unit:`minutes`}},Xe={no_data:`No departures available`,betriebsschluss:`End of service`,stale_feed:`No live data`,stale_feed_detail:`Wiener Linien is sending out-of-date departure times for this stop. Departures return automatically once live data resumes.`,stale_feed_since:`Last reported departure: {time}`,stale_feed_partial:`Some lines aren't reporting current times.`,min:`min`,now:`Now`,platform_short_rail:`Track`,platform_short_bus:`Bay`,version_update:`Wiener Linien Austria updated to v{v} — please reload`,version_reload:`Reload`,version_reload_stuck:`Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.`,entity_missing:`Sensor {entity} no longer exists. Pick a different sensor, or remove it from this card's stops.`,no_entities_picked:`No stop selected`,no_entities_available:`No Wiener Linien sensors found`,departures_list:`Upcoming departures`,barrier_free_title:`Step-free access`,cooling_title:`Air conditioned`,disturbance_title:`Traffic disruption reported`,stops_ahead_aria_show:`Show stops ahead for {line} towards {towards}`,stops_ahead_aria_hide:`Hide stops ahead for {line} towards {towards}`,stops_ahead_other_show:`Show {count} more lines at {stop}`,stops_ahead_other_hide:`Hide other lines at {stop}`,dir_h:`Outbound`,dir_r:`Return`,dir_h_short:`H`,dir_r_short:`R`,dir_both:`Both`,traffic_label:`Disruption`,traffic_until:`Until`,traffic_updated:`updated`,elevator_until:`Until`,open_in_maps:`Open in maps`,qr_open:`Show QR code`,qr_dialog_title:`QR code for stop`,qr_dialog_hint:`Scan with your phone — opens the stop in your maps app.`,qr_dialog_close:`Close QR code`,delay_singular:`1 min. late`,delay_plural:`{n} min. late`,devmode_title:`DEV`,devmode_traffic_btn:`Test disruption`,devmode_elevator_btn:`Test elevator`,devmode_colors_btn:`Line colours`,devmode_clear_btn:`Clear`,editor:{accessibility_only:`Only show step-free departures`,accessibility_only_requires:`Requires “Show accessibility icon”.`,colors_empty_hint:`Pick stops on the Stops tab — their lines will show up here.`,colors_hint:`Optional. Without an override the official line colour applies.`,hide_attribution:`Hide data source`,hide_attribution_helper:`When on, the data-source credit is hidden.`,hide_header:`Hide header`,hide_header_helper:`When on, the card title bar is hidden.`,layout:`Multi-stop layout`,layout_requires:`Only takes effect with two or more stops.`,layout_stacked:`Stacked`,layout_tabs:`Tabs`,max_departures:`Departures per stop`,pick_color_for_line:`Pick colour for line {line}`,reset_color:`Reset to default`,reset_color_aria:`Reset line colour {line} to default`,section_colors:`Line colours`,section_colors_hint:`overrides the API colour`,section_departure_row_hint:`per row`,section_disruptions:`Disruptions & delays`,section_layout:`Structure`,section_layout_hint:`Layout`,show_accessibility:`Show step-free icon`,show_cooling:`Show air-conditioning icon`,show_cooling_helper:`Shows a snowflake beside departures with an air-conditioned vehicle. Wiener Linien report this per vehicle — older trains and trams don't send it.`,show_delay:`Show delays`,show_delay_colors:`Colour-code delays`,show_delay_colors_helper:`Turns the countdown number red when a departure runs late and green when it runs early.`,show_delay_colors_requires:`Requires “Show delays”.`,show_departures:`Show departure list`,show_elevator_info:`Show elevator outages`,show_hero_metric:`Show next departure large`,show_platform:`Show platform / track`,show_qr_button:`Show QR-code button`,show_stops_ahead:`Show intermediate stops`,show_traffic_info:`Show disruption alerts`,show_type_icon:`Show vehicle-type icon`}},Ze={editor:{accessibility_only:`Only show step-free departures`,chips:`Extra labels`,date_format:`Date format`,exit:`Exit icon`,extra_icons:`Extra icons`,flicker:`Simulate LED flicker`,header_exit_accessible:`Step-free exit`,header_exit_none:`None`,header_exit_regular:`Exit`,housing:`Show LED cabinet frame`,housing_helper:`Dark bezel around the LED panel with a subtle glass reflection on top.`,icon_mdi_door_open:`Open door`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_stairs:`Stairs`,line_stripe:`Show line stripe`,line_stripe_helper:`A 4 px coloured bar at the left edge of each row, matched to the line.`,message_text:`Message`,message_text_requires:`Requires “Show ticker”.`,message_ticker:`Scrolling message`,message_ticker_helper:`Runs a custom message across the display every 5 minutes.`,platform_side:`Platform side`,platform_side_auto:`Auto (1 = right, 2 = left)`,platform_side_helper:`Default follows Wiener Linien signage (platform 2 on the left, otherwise right). Override manually if needed.`,platform_side_left:`Always left`,platform_side_requires:`Requires “Show platform”.`,platform_side_right:`Always right`,show_clock:`Show clock chip`,show_date:`Show date chip`,show_header:`Show station sign`,show_header_helper:`Master switch. Per-side settings are kept.`,show_line_pill:`Show line badge`,show_line_pill_helper:`Renders the line code as a filled badge in the line colour rather than plain text.`,show_platform:`Show platform`,show_station_name:`Show station name`,show_unit:`Show the “min” unit`,show_unit_helper:`Trail each countdown number with a small amber "min" caption.`,size:`Size`,station_bg:`Station-name background`,station_bg_black:`Black`,station_bg_default:`Default`,station_bg_white:`White`,style:`Style`,style_classic:`Classic`,style_pixel:`Dot matrix`,style_warm:`Warm`,text:`Sign text`,wheelchair_race:`Wheelchair race (easter egg)`},aria_dismiss_message:`Dismiss scrolling message`,aria_start_race:`Start accessibility race`,at_platform:`Arriving`,barrier_free_title:`Step-free access`,betriebsschluss:`End of service`,countdown_minutes:`{n} minutes`,departures_list:`Upcoming departures`,dir_both:`Both`,dir_h:`Outbound`,dir_h_short:`H`,dir_r:`Return`,dir_r_short:`R`,entity_missing:`Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.`,gleis:`PLATF.`,header:{icon_exit:`Exit`,icon_exit_access:`Step-free exit`,icon_wc:`Toilet`,icon_escalator:`Escalator`,icon_elevator:`Elevator`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_door_open:`Open door`,icon_mdi_stairs:`Stairs`},no_data:`No departures`,no_data_wrong_direction:`No departures in this direction`,no_data_wrong_line:`No departures for this line`,no_entity:`No stop selected`,race_finished:`Accessibility race finished`,race_starting_in:`Race starting in {n}`,race_winner_announce:`Wheelchair {n} wins the accessibility race`,stale_feed:`No live data`,steig:`BAY`,unit_min:`min`,version_reload:`Reload`,version_reload_stuck:`Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.`,version_update:`Retro card updated to v{v} — please reload`,via_prefix:`VIA`},Qe={no_entity:`No stop selected`,no_data:`No departures`,no_data_wrong_direction:`No departures in this direction`,no_data_wrong_line:`No departures for this line`,betriebsschluss:`End of service`,stale_feed:`No live data`,dir_h:`Outbound`,dir_r:`Return`,dir_h_short:`H`,dir_r_short:`R`,gleis:`PLATF.`,steig:`BAY`,col_line:`LINE`,col_dest:`DIRECTION`,col_step_free:`STEP-FREE`,col_cd:`ARRIVAL`,version_update:`Flap card updated to v{v} — please reload`,version_reload:`Reload`,version_reload_stuck:`Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.`,entity_missing:`Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.`,departures_list:`Upcoming departures`,at_platform:`Arriving`,countdown_minutes:`{n} minutes`,barrier_free_title:`Step-free access`,not_barrier_free_title:`Step-free access not available`,unit_min:`min`,dir_both:`Both`,header:{icon_exit:`Exit`,icon_exit_access:`Step-free exit`,icon_wc:`Toilet`,icon_escalator:`Escalator`,icon_elevator:`Elevator`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_door_open:`Open door`,icon_mdi_stairs:`Stairs`},editor:{accessibility_only:`Only show step-free departures`,accessibility_only_requires:`Requires “Show wheelchair badge”.`,chips:`Extra labels`,date_format:`Date format`,exit:`Exit icon`,extra_icons:`Extra icons`,header_exit_accessible:`Step-free exit`,header_exit_none:`None`,header_exit_regular:`Exit`,hide_attribution:`Hide data source`,hide_attribution_helper:`When on, the CC-BY credit at the bottom of the card is hidden. The Wiener Linien Open Government Data licence requires visible attribution unless you keep the credit elsewhere on the dashboard.`,housing:`Show cabinet frame`,housing_helper:`Wraps the board in the cabinet with a soft inset bevel and drop shadow. Cabinet colour follows your HA theme (cream on light, dark on dark). When off, the board sits flush against the dashboard.`,icon_mdi_door_open:`Open door`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_stairs:`Stairs`,max_rows:`Number of rows`,max_rows_helper:`How many departures to show on the board (1–8). Merged across all stops, sorted by countdown.`,show_accessibility:`Show step-free tile`,show_accessibility_helper:`Add a wheelchair pictogram tile next to step-free departures.`,show_clock:`Show clock chip`,show_date:`Show date chip`,show_header:`Show station sign`,show_header_helper:`Master switch. Per-side settings are kept.`,show_line_column:`Show line column`,show_line_column_helper:`Shows the column carrying the line code. Turn it off when the board only ever shows one line.`,show_min_unit:`Show "min" caption`,show_min_unit_helper:`Small label next to the countdown number, like real station boards.`,show_platform:`Show platform / track`,show_platform_helper:`Adds a per-row platform tile between the destination and the countdown. Only shown when at least one visible row has a platform value.`,show_station_name:`Show station name`,show_station_name_helper:`Coloured band with the station name and current time at the top of the card.`,size:`Size`,station_bg:`Station-name background`,station_bg_black:`Black`,station_bg_helper:`Default is the colour of the first tracked line (e.g. red for U1, orange for U3). On multi-line boards you can pick a specific line, or override with solid white or black.`,station_bg_line:`First line`,station_bg_white:`White`,text:`Sign text`}},$e={common:Ye,modern:Xe,retro:Ze,flap:Qe};const et={de:He,en:Je},tt=et.de??{};function nt(e,t){return e.split(`.`).reduce((e,t)=>{if(e&&typeof e==`object`&&t in e)return e[t]},t)}function rt(e,t){let n=nt(e,t);return typeof n==`string`?n:void 0}function it(e){return((e.configLanguage||e.hassLanguage||`de`).split(/[-_]/)[0]??`de`)===`en`?`en`:`de`}function at(e,t,n){let r=it(t),i=rt(e,et[r]??tt);if(i===void 0&&(i=rt(e,tt)),i===void 0)return e;if(n)for(let[e,t]of Object.entries(n))i=i.replace(`{${e}}`,String(t));return i}async function ot(e,t,n){if(!e?.callWS)return null;try{let r=await e.callWS({type:t});if(r?.version&&r.version!==n)return r.version}catch{}return null}function st(e){try{window.caches?.keys?.().then(e=>{e.forEach(e=>window.caches?.delete?.(e))})}catch{}if(e)try{window.sessionStorage?.setItem(`wl-reload-attempted-${e}`,`1`)}catch{}window.location.reload()}function ct(e){if(!e)return!1;try{return window.sessionStorage?.getItem(`wl-reload-attempted-${e}`)===`1`}catch{return!1}}function lt(e,t,n=`banner`){if(!e)return L;if(ct(e)){let e=t(`version_reload_stuck`);return F`
      <div class=${n} role="alert" aria-live="assertive">
        <span>${e}</span>
      </div>
    `}let r=t(`version_update`).replace(`{v}`,e),i=t(`version_reload`);return F`
    <div class=${n} role="alert" aria-live="assertive">
      <span>${r}</span>
      <button
        type="button"
        aria-label=${i}
        @click=${()=>st(e)}
      >
        ${i}
      </button>
    </div>
  `}function ut(e){if(e?.themes?.darkMode===!0)return`dark`;if(e?.themes?.darkMode===!1)return`light`}const dt=e=>Math.min(1,Math.max(0,e)),K=e=>e<=.04045?e/12.92:((e+.055)/1.055)**2.4,ft=e=>e<=.0031308?e*12.92:1.055*e**(1/2.4)-.055;function pt(e){let t=e.trim();if(!t||t.includes(`var(`))return null;let n=/^#[0-9a-f]{3,8}$/i.test(t)?t.slice(1):``;if(!n){let e=``;try{let n=document.createElement(`span`).style;n.color=t,e=n.color.trim()}catch{return null}let n=/^rgba?\(([^)]+)\)$/.exec(e);if(!n?.[1])return null;let[r,i,a]=n[1].split(/[,\s/]+/).filter(Boolean).map(Number);return r===void 0||i===void 0||a===void 0||![r,i,a].every(Number.isFinite)?null:[K(r/255),K(i/255),K(a/255)]}if((n.length===3||n.length===4)&&(n=[...n.slice(0,3)].map(e=>e+e).join(``)),n.length!==6&&n.length!==8)return null;let r=Number.parseInt(n.slice(0,6),16);return Number.isFinite(r)?[K((r>>16&255)/255),K((r>>8&255)/255),K((r&255)/255)]:null}function mt([e,t,n]){let r=Math.cbrt(.4122214708*e+.5363325363*t+.0514459929*n),i=Math.cbrt(.2119034982*e+.6806995451*t+.1073969566*n),a=Math.cbrt(.0883024619*e+.2817188376*t+.6299787005*n);return[.2104542553*r+.793617785*i-.0040720468*a,1.9779984951*r-2.428592205*i+.4505937099*a,.0259040371*r+.7827717662*i-.808675766*a]}function ht([e,t,n]){let r=(e+.3963377774*t+.2158037573*n)**3,i=(e-.1055613458*t-.0638541728*n)**3,a=(e-.0894841775*t-1.291485548*n)**3;return[4.0767416621*r-3.3077115913*i+.2309699292*a,-1.2684380046*r+2.6097574011*i-.3413193965*a,-.0041960863*r-.7034186147*i+1.707614701*a]}const gt=([e,t,n])=>`#`+[e,t,n].map(e=>Math.round(dt(ft(e))*255).toString(16).padStart(2,`0`)).join(``);function _t(e,t){if(t===void 0)return null;let n=pt(e);if(!n)return null;let[r,i,a]=mt(n),o=t===`dark`?Math.max(.72,r):Math.min(.45,r);if(o===r)return gt(n);let s=Math.hypot(i,a),c=Math.atan2(a,i),l=ht([o,s*Math.cos(c),s*Math.sin(c)]);return gt([dt(l[0]),dt(l[1]),dt(l[2])])}const q={show_station_name:{retro:!1,flap:!0},housing:{retro:!1,flap:!0},size:{retro:`regular`,flap:`small`},unit_caption:{retro:!1,flap:!0},station_bg:{retro:`default`,flap:`line`},show_platform:{retro:!0,flap:!0}},vt={retro:2},yt={exit:{kind:`svg`,viewBox:`0 0 36.29 29.04`,glyphPointsTo:`left`,labelKey:`icon_exit`,shapes:()=>pe`
      <polygon points="31.29 0 18.99 0 13.99 0 13.99 5 13.99 10.31 18.99 10.31 18.99 5 31.29 5 31.29 24.04 18.99 24.04 18.99 18.44 13.99 18.44 13.99 24.04 13.99 29.04 18.99 29.04 31.29 29.04 36.29 29.04 36.29 24.04 36.29 5 36.29 0 31.29 0"/>
      <polygon points="24.22 12.38 7.65 12.38 12.5 7.53 6.85 7.53 0 14.37 6.85 21.23 12.51 21.23 12.51 21.23 7.66 16.38 24.22 16.38 24.22 12.38"/>
    `},"exit-access":{kind:`svg`,viewBox:`0 0 36.29 29.04`,glyphPointsTo:`right`,labelKey:`icon_exit_access`,shapes:()=>pe`
      <polygon points="17.3 18.73 17.3 24.04 5 24.04 5 5 17.3 5 17.3 10.59 22.3 10.59 22.3 5 22.3 0 17.3 0 5 0 0 0 0 5 0 24.04 0 29.04 5 29.04 17.3 29.04 22.3 29.04 22.3 24.04 22.3 18.73 17.3 18.73"/>
      <circle cx="9.97" cy="8.73" r="1.05"/>
      <path d="M9.04,10.69h0v4.12h0c0,.36.5.66,1.12.66h3.48l1.2,2.87h1l-1.2-2.87-.39-.93h-2.97v-1.47h2.32s-.09-.68-.58-.68h-1.74v-1.7h0c0-.36-.5-.66-1.12-.66s-1.12.29-1.12.66Z"/>
      <path d="M11.67,18.74c1.04-.58,1.78-1.63,1.91-2.87h-.72c-.18,1.49-1.45,2.64-2.98,2.64-1.66,0-3.01-1.35-3.01-3.01,0-1.21.71-2.24,1.74-2.72v-.77c-1.43.52-2.45,1.89-2.45,3.49,0,2.05,1.67,3.72,3.72,3.72h6.32v-.48h-4.53Z"/>
      <polygon points="29.44 7.81 23.79 7.81 23.79 7.81 28.63 12.66 17.3 12.66 17.3 16.66 28.64 16.66 23.79 21.51 29.45 21.51 36.29 14.66 29.44 7.81"/>
    `},wc:{kind:`text`,text:`WC`,labelKey:`icon_wc`},escalator:{kind:`svg`,viewBox:`0 0 36.74 28.3`,labelKey:`icon_escalator`,shapes:()=>pe`
      <polygon points="27.05 0 27.05 3.08 23.69 3.08 23.69 6.17 20.32 6.17 20.32 9.25 16.96 9.25 16.96 12.33 13.64 12.33 13.64 15.42 10.28 15.42 10.28 18.5 6.91 18.5 6.91 22.14 0 22.14 0 28.3 7.97 28.3 30.42 6.17 36.74 6.17 36.74 0 27.05 0"/>
    `},elevator:{kind:`svg`,viewBox:`0 0 24.01 36.69`,labelKey:`icon_elevator`,shapes:()=>pe`
      <path d="M14.82,19.29h-5.63c-.37,0-.68.3-.68.68v5.15c0,.37.3.68.68.68s.68-.3.68-.68v-4.48h.42v12.32c0,.37.3.68.68.68s.68-.3.68-.68v-7.42h.73v7.42c0,.37.3.68.68.68s.68-.3.68-.68v-12.32h.42v4.48c0,.37.3.68.68.68s.68-.3.68-.68v-5.15c0-.37-.3-.68-.68-.68Z"/>
      <circle cx="12" cy="17.3" r="1.57"/>
      <path d="M22.6,14.1v21.18H1.41V14.1h21.18M24.01,12.68H0v24.01h24.01V12.68h0Z"/>
      <polygon points="11.11 4.94 6.17 0 1.23 4.94 1.23 7.6 5.23 3.61 5.23 11.48 7.11 11.48 7.11 3.61 11.11 7.6 11.11 4.94"/>
      <polygon points="12.9 6.54 17.84 11.48 22.78 6.54 22.78 3.87 18.78 7.87 18.78 0 16.9 0 16.9 7.87 12.9 3.87 12.9 6.54"/>
    `}},bt=[`mdi:exit-run`,`mdi:exit-to-app`,`mdi:door-open`,`mdi:stairs`],xt={"mdi:exit-run":{labelKey:`icon_mdi_exit_run`,glyphPointsTo:`right`},"mdi:exit-to-app":{labelKey:`icon_mdi_exit_to_app`,glyphPointsTo:`right`},"mdi:door-open":{labelKey:`icon_mdi_door_open`},"mdi:stairs":{labelKey:`icon_mdi_stairs`}};function St(e){return typeof e==`string`&&e in xt}function Ct(e,t){let n=yt[e];if(n.kind===`text`)return F`<span class="retro-station-header__tile" role="img" aria-label=${t.ariaLabel}>
      <span class="retro-station-header__monogram" aria-hidden="true">${n.text}</span>
    </span>`;let r=t.flipX?`retro-station-header__icon retro-station-header__icon--flip-x`:`retro-station-header__icon`;return F`<span class="retro-station-header__tile" role="img" aria-label=${t.ariaLabel}>
    <svg
      class=${r}
      viewBox=${n.viewBox}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >${n.shapes()}</svg>
  </span>`}function wt(e,t){let n=t.flipX?`retro-station-header__mdi retro-station-header__mdi--flip-x`:`retro-station-header__mdi`;return F`<span class="retro-station-header__tile retro-station-header__tile--mdi" role="img" aria-label=${t.ariaLabel}>
    <ha-icon class=${n} icon=${e}></ha-icon>
  </span>`}function Tt(e,t){return F`<span class="retro-station-header__tile retro-station-header__tile--mdi" role="img" aria-label=${t}>
    <ha-icon class="retro-station-header__mdi" icon=${e}></ha-icon>
  </span>`}function Et(e,t){return typeof e==`boolean`?e:t}const Dt=new Set([`small`,`medium`,`regular`]),Ot=new Set([`default`,`white`,`black`]),kt=new Set([`classic`,`warm`,`pixel`]),At=new Set([`auto`,`left`,`right`]),jt=new Set([`none`,`regular`,`accessible`,...bt]);function Mt(e,t,n){if(typeof e!=`string`)return;let r=n?e.trim().slice(0,t):e.slice(0,t);return r.length>0?r:void 0}function Nt(e,t){if(!Array.isArray(e))return;let{maxCount:n,truncateTo:r,accept:i}=t,a=e.filter(e=>typeof e==`string`).map(e=>r===void 0?e.trim():e.trim().slice(0,r)).filter(e=>e.length>0&&(i===void 0||i(e))).slice(0,n);return a.length>0?a:void 0}const Pt=/^[a-z0-9_-]+:[a-z0-9_-]+$/i;function Ft(e){if(!e||typeof e!=`object`)return;let t=e,n={},r=jt.has(t.exit)?t.exit:`none`;r!==`none`&&(n.exit=r);let i=Mt(t.text,64,!0);i!==void 0&&(n.text=i),t.show_wc===!0&&(n.show_wc=!0),t.show_escalator===!0&&(n.show_escalator=!0),t.show_elevator===!0&&(n.show_elevator=!0),t.show_clock===!0&&(n.show_clock=!0),t.show_date===!0&&(n.show_date=!0);let a=Nt(t.chips,{truncateTo:16,maxCount:6});a!==void 0&&(n.chips=a);let o=Nt(t.extra_icons,{maxCount:3,accept:e=>Pt.test(e)&&e.length<=64});if(o!==void 0&&(n.extra_icons=o),Object.keys(n).length===0)return;let s=Mt(t.date_format,32,!1);return s!==void 0&&(n.date_format=s),n}function It(e,t){let n={};if(!e||typeof e!=`object`)return n;for(let[r,i]of Object.entries(e))t.has(r)||(n[r]=i);return n}function Lt(e){if(!e||typeof e!=`object`)return;let t={};for(let[n,r]of Object.entries(e)){let e=typeof r==`number`?r:typeof r==`string`?Number(r):NaN;if(!Number.isFinite(e)||e<0||e>120){console.warn(`[wiener-linien-austria] walk_times["${n}"] = ${JSON.stringify(r)} is not a finite number in 0..120 — dropping`);continue}let i=n.split(`|`),a=i.length>=3?`${i[0]}|${i[1]}`:n,o=Math.round(e),s=t[a];t[a]=s===void 0?o:Math.max(s,o)}return Object.keys(t).length?t:void 0}const Rt=new Set([`type`,`entity`,`direction`,`line`,`show_platform`,`platform_side`,`show_station_name`,`station_bg`,`size`,`style`,`flicker`,`wheelchair_race`,`accessibility_only`,`message_ticker`,`message_text`,`walk_times`,`show_header`,`header_left`,`header_right`,`show_line_pill`,`line_pill`,`line_stripe`,`housing`,`show_unit`]);function zt(e){let t=e.direction===`R`?`R`:`H`,n=Dt.has(e.size)?e.size:q.size.retro,r=Ot.has(e.station_bg)?e.station_bg:q.station_bg.retro,i=kt.has(e.style)?e.style:`classic`;return{...It(e,Rt),type:e.type||`custom:wiener-linien-austria-retro-card`,entity:typeof e.entity==`string`&&e.entity.startsWith(`sensor.`)?e.entity:void 0,direction:t,line:typeof e.line==`string`&&e.line?e.line:void 0,show_platform:Et(e.show_platform,q.show_platform.retro),platform_side:At.has(e.platform_side)?e.platform_side:`auto`,show_station_name:Et(e.show_station_name,q.show_station_name.retro),station_bg:r,size:n,style:i,flicker:e.flicker===!0,wheelchair_race:e.wheelchair_race===!0,accessibility_only:e.accessibility_only===!0,message_ticker:e.message_ticker===!0,message_text:typeof e.message_text==`string`&&e.message_text.trim()?e.message_text.slice(0,160):void 0,walk_times:Lt(e.walk_times),show_header:e.show_header===!0,header_left:Ft(e.header_left),header_right:Ft(e.header_right),show_line_pill:e.show_line_pill===void 0?e.line_pill===!0:e.show_line_pill===!0,line_stripe:e.line_stripe===!0,housing:Et(e.housing,q.housing.retro),show_unit:Et(e.show_unit,q.unit_caption.retro)}}function Bt(e,t,n={},r=`var(--primary-color)`){let i=e.toUpperCase();if(t[i]!==void 0)return{background:t[i]};if(/^N\d/.test(i))return{background:`#1b1464`,color:`#fef200`};let a=n[e]??n[i];return a?.bg?a.fg?{background:`#${a.bg}`,color:`#${a.fg}`}:{background:`#${a.bg}`}:{background:r}}function Vt(e,t,n={},r,i=`var(--primary-color)`){let a=Bt(e,t,n,i);return{fill:a.background,ink:a.color,text:_t(a.background,r)??void 0}}function Ht(e,t){return`${e}|${t}`}function Ut(e){let t=[],n=new Set;for(let r of e?.departures??[]){let e=String(r.direction??``),i=`${r.line}|${e}|${r.towards}`;n.has(i)||(n.add(i),t.push({line:r.line,direction:e,towards:r.towards,type:r.type}))}return t.sort((e,t)=>e.line===t.line?e.towards.localeCompare(t.towards):e.line.localeCompare(t.line)),t}function Wt(e){let t=new Map;for(let n of e?.departures??[]){let e=String(n.direction??``),r=Ht(n.line,e),i=t.get(r);i||(i={line:n.line,direction:e,type:n.type,termini:[]},t.set(r,i)),n.towards&&!i.termini.includes(n.towards)&&i.termini.push(n.towards)}let n=Array.from(t.values());return n.sort((e,t)=>e.line===t.line?e.direction.localeCompare(t.direction):e.line.localeCompare(t.line)),n}function Gt(e,t){if(!e.length)return t.full;let n=e.slice(0,3).join(` / `),r=e.length>3?` +${e.length-3}`:``;return`${t.short}: ${n}${r}`}function Kt(e,t){if(!e)return[];let n=new Set;if(e.tracked_line_keys?.length){for(let r of e.tracked_line_keys){let[e,i]=r.split(`|`,2);e&&(t&&i!==t||n.add(e))}if(n.size>0)return[...n].sort()}for(let r of e.departures??[])t&&r.direction!==t||r.line&&n.add(r.line);return[...n].sort()}function qt(e,t){let n=new Set;for(let r of e?.tracked_line_keys??[]){let[e,i]=r.split(`|`,2);t&&e!==t||(i===`H`||i===`R`)&&n.add(i)}if(n.size===0)for(let r of e?.departures??[])t&&r.line!==t||(r.direction===`H`||r.direction===`R`)&&n.add(r.direction);let r=[...n];return{available:n,unknown:n.size===0,oneWay:n.size===1?r[0]??null:null}}function Jt(e,t){if(t.size===0)return[...e];let n=e.filter(e=>t.has(e));for(let e of t)n.includes(e)||n.push(e);return n}function Yt(e){if(e?.tracked_lines?.length)return[...e.tracked_lines].sort();let t=new Set;if(e?.lines_at_stop?.length)for(let n of e.lines_at_stop)t.add(n);for(let n of e?.departures??[])n.line&&t.add(n.line);return Array.from(t).sort()}function Xt(e,t){let{lines:n,direction:r,line_directions:i,walk_times:a,accessibility_only:o}=t,s=n&&n.length?new Set(n):null;return e.filter(e=>{if(s&&!s.has(e.line))return!1;let t=i?.[e.line]??r;if(t&&e.direction!==t)return!1;if(a){let t=a[Ht(e.line,String(e.direction??``))];if(typeof t==`number`&&e.countdown<t)return!1}return!(o&&!e.barrier_free)})}function Zt(e,t){let{lines:n,picked:r,lineDirections:i,stopDirection:a}=t,o=e=>i[e]??a,s=Wt(e).filter(e=>{if(r.size>0&&!r.has(e.line))return!1;let t=o(e.line);return!t||e.direction===t}),c=new Set(s.map(e=>e.line)),l=Jt(n,r),u=[];for(let e of l){if(c.has(e))continue;let t=o(e);for(let n of t?[t]:[`H`,`R`])u.push({line:e,direction:n,type:``,termini:[]})}return[...s,...u].sort((e,t)=>e.line===t.line?e.direction.localeCompare(t.direction):e.line.localeCompare(t.line))}const Qt=`ptMetro`;function $t(e){switch(e){case Qt:return`mdi:subway-variant`;case`ptTram`:return`mdi:tram`;case`ptBusCity`:case`ptBusNight`:return`mdi:bus`;default:return null}}function en(e,t){let n=Array.isArray(t.departures)?t.departures:[],r=Xt(n,{direction:e.direction,lines:e.line?[e.line]:void 0,walk_times:e.walk_times,accessibility_only:e.accessibility_only}),i=r.slice(0,vt.retro),a=i.find(e=>e.platform)?.platform??null,o=e.show_platform?a:null,s;switch(e.platform_side){case`left`:s=!0;break;case`right`:s=!1;break;default:s=o===`2`}let c=(i[0]?.type??``)===Qt;return{rows:i,matching:r,departures:n,platform:o,gleisLeft:s,platformLabelKey:c?`gleis`:`steig`,stopName:t.stop_name||t.friendly_name||``}}function tn(e){if(!e)return[];let t=[];for(let[n,r]of Object.entries(e.states??{})){if(!n.startsWith(`sensor.`))continue;let e=r?.attributes??{};typeof e.diva==`number`&&Array.isArray(e.departures)&&e.next_by_line&&typeof e.next_by_line==`object`&&t.push(n)}return t.sort(),t}const nn=`wl-austria-fonts`;function rn(){if(typeof document>`u`||document.getElementById(nn))return;let e=document.createElement(`style`);e.id=nn,e.textContent=`
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
`,document.head.appendChild(e)}function an(e){if(!e)return null;let t=Date.parse(e);if(!Number.isFinite(t))return null;let n=new Date(t);return`${String(n.getHours()).padStart(2,`0`)}:${String(n.getMinutes()).padStart(2,`0`)}`}function J(e){return String(e).padStart(2,`0`)}function on(e,t,n=`de`){if(!t)return``;let r=n===`en`?`en-GB`:`de-AT`,i=()=>e.toLocaleDateString(r,{weekday:`long`}),a=()=>e.toLocaleDateString(r,{weekday:`short`}),o=()=>e.toLocaleDateString(r,{month:`long`}),s=()=>e.toLocaleDateString(r,{month:`short`}),c=``,l=0;for(;l<t.length;){let n=t[l];if(n===`\\`&&l+1<t.length){c+=t[l+1],l+=2;continue}switch(n){case`d`:c+=J(e.getDate());break;case`j`:c+=String(e.getDate());break;case`D`:c+=a();break;case`l`:c+=i();break;case`m`:c+=J(e.getMonth()+1);break;case`n`:c+=String(e.getMonth()+1);break;case`M`:c+=s();break;case`F`:c+=o();break;case`Y`:c+=String(e.getFullYear());break;case`y`:c+=J(e.getFullYear()%100);break;case`H`:c+=J(e.getHours());break;case`G`:c+=String(e.getHours());break;case`h`:c+=J((e.getHours()+11)%12+1);break;case`g`:c+=String((e.getHours()+11)%12+1);break;case`i`:c+=J(e.getMinutes());break;case`s`:c+=J(e.getSeconds());break;default:c+=n??``}l++}return c}function sn(e,t,n){if(!e||!t)return null;let r=Date.parse(e);return Number.isFinite(r)?on(new Date(r),t,n):null}function cn(e,t,n,r,i){let a=L;if(e.exit===`regular`||e.exit===`accessible`){let n=e.exit===`regular`?`exit`:`exit-access`;a=Ct(n,{ariaLabel:r(`header.${yt[n].labelKey}`),flipX:yt[n].glyphPointsTo!==t})}else if(e.exit&&St(e.exit)){let n=xt[e.exit];a=wt(e.exit,{ariaLabel:r(`header.${n.labelKey}`),flipX:n.glyphPointsTo!==void 0&&n.glyphPointsTo!==t})}let o=e.text?F`<span class="retro-station-header__text">${e.text}</span>`:L,s=e=>Ct(e,{ariaLabel:r(`header.${yt[e].labelKey}`)}),c=e.show_wc?s(`wc`):L,l=e.show_escalator?s(`escalator`):L,u=e.show_elevator?s(`elevator`):L,d=(e.extra_icons??[]).map(e=>Tt(e,e)),f=[...d].reverse(),p=(e.chips??[]).map(e=>F`<span class="retro-station-header__chip">${e}</span>`),m=[...p].reverse(),h=e.show_clock?an(n):null,g=h?F`<span
        class="retro-station-header__chip retro-station-header__chip--clock"
      >
        <ha-icon
          class="retro-station-header__chip-icon"
          icon="mdi:clock-outline"
        ></ha-icon>
        <span>${h}</span>
      </span>`:L,_=e.show_date?sn(n,e.date_format??`d.m.Y`,i):null,v=_?F`<span
        class="retro-station-header__chip retro-station-header__chip--date"
        >${_}</span
      >`:L;return t===`left`?F`${a}${o}${u}${l}${c}${d}${p}${v}${g}`:F`${g}${v}${m}${f}${c}${l}${u}${o}${a}`}function ln(e){let{left:t,right:n,serverTime:r,t:i,lang:a}=e;return!t&&!n?L:F`
    <div class="retro-station-header" role="group">
      <div class="retro-station-header__side retro-station-header__side--left">
        ${t?cn(t,`left`,r,i,a):L}
      </div>
      <div class="retro-station-header__side retro-station-header__side--right">
        ${n?cn(n,`right`,r,i,a):L}
      </div>
    </div>
  `}const un=[[`A`,`A`,`B`],[`B`,`B`,`A`],[`A`,`B`,`B`],[`B`,`A`,`A`],[`A`,`B`,`A`],[`B`,`A`,`B`]],dn=1.08,fn=1.15,pn=[100,250],mn=[200,500],hn=[500,900],gn=[.25,.5,.75],_n=[3,2.5,2.5];function vn(e){let t=(e,t)=>e+Math.random()*(t-e),n=(e,t)=>e+(Math.random()*2-1)*t,r=Math.random()<.5?`A`:`B`,i=Math.random()<.3?r===`A`?`B`:`A`:r,a=un.filter(e=>e[2]===i),o=a[Math.floor(Math.random()*a.length)],s=Math.random(),c=s<.4?t(pn[0],pn[1]):s<.75?t(mn[0],mn[1]):t(hn[0],hn[1]),l=t(2400,2700),u=l+c,d=l*t(dn,fn),f=u*t(dn,fn),p=r===`A`?d:f,m=r===`B`?d:f,h=r===`A`?l:u,g=r===`B`?l:u,_=e.a,v=e.b,y=e.finishCqw,b=Math.max(_,v),x=Math.max(20,92-b),S=(e,t)=>{let r=b+gn[t]*x,i=o[t]===e,a=_n[t];return n(r+(i?a:-a),.6)},C=S(`A`,0),ee=S(`A`,1),w=S(`A`,2),T=S(`B`,0),te=S(`B`,1),E=S(`B`,2),ne=(e,t,n)=>{let r=y-n,i=e-.75*t;if(r<=0||i<=1)return Math.max(n+5,102);let a=n+r*.25*t/i;return Math.max(102,Math.min(135,a))},D=ne(h,p,w),O=ne(g,m,E),k=(e,t,n,r,i,a)=>{let o=[[0,.25,e,t],[.25,.5,t,n],[.5,.75,n,r],[.75,1,r,i]];for(let[e,t,n,r]of o){if(n>=y)return e*a;if(r>=y)return(e+(y-n)/(r-n)*(t-e))*a}return 1/0},re=k(_,C,ee,w,D,p),A=k(v,T,te,E,O,m);return{winner:re<=A?`A`:`B`,winnerCrossT:Math.min(re,A),cssVars:{"--race-a-duration":`${p}ms`,"--race-b-duration":`${m}ms`,"--race-a-end":`${D-_}cqw`,"--race-b-end":`${O-v}cqw`,"--race-a-x-25":`${C-_}cqw`,"--race-a-x-50":`${ee-_}cqw`,"--race-a-x-75":`${w-_}cqw`,"--race-b-x-25":`${T-v}cqw`,"--race-b-x-50":`${te-v}cqw`,"--race-b-x-75":`${E-v}cqw`}}}const yn=c`:host {
display: block;
}
.wl-editor {
display: flex;
flex-direction: column;
}
.wl-tabs {
display: flex;
gap: 2px;
padding: 0 8px;
background: var(--card-background-color);
border-bottom: 1px solid var(--divider-color);
position: sticky;
top: 0;
z-index: 3;
}
.wl-tab {
flex: 1;
min-width: 0;
border: 0;
background: transparent;
cursor: pointer;
padding: 12px 8px 0;
font-size: 0.78125rem;
font-weight: 500;
line-height: 1.2;
letter-spacing: 0.02em;
text-transform: uppercase;
color: var(--secondary-text-color);
}
.wl-tab[aria-selected="true"] {
color: var(--primary-color);
}
.wl-tab-label {
display: block;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
}
.wl-tab-underline {
display: block;
height: 2px;
margin: 7px -8px -1px;
border-radius: 2px 2px 0 0;
background: transparent;
}
.wl-tab[aria-selected="true"] .wl-tab-underline {
background: var(--primary-color);
}
.wl-tab:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: -2px;
}
.wl-panel {
padding: 14px 16px 22px;
display: flex;
flex-direction: column;
gap: 16px;
}
.wl-panel--stops {
gap: 14px;
}
.wl-section {
border: 1px solid var(--divider-color);
border-radius: 10px;
background: var(--card-background-color);
overflow: hidden;
}
.wl-section-header {
display: flex;
align-items: center;
gap: 8px;
padding: 10px 12px;
background: var(--secondary-background-color);
border-bottom: 1px solid var(--divider-color);
}
.wl-section-title {
flex: 1;
min-width: 0;
font-size: 0.875rem;
font-weight: 500;
line-height: 1.35;
color: var(--primary-text-color);
overflow-wrap: anywhere;
}
.wl-section-hint {
font-size: 0.71875rem;
font-weight: 400;
line-height: 1.35;
color: var(--secondary-text-color);
text-align: right;
}
.wl-section-body {
padding: 6px 12px 12px;
display: flex;
flex-direction: column;
}
.wl-section-body ha-form {
display: block;
}
.wl-group {
display: flex;
flex-direction: column;
gap: 7px;
}
.wl-group-head {
display: flex;
align-items: baseline;
gap: 8px;
}
.wl-label {
font-size: 0.75rem;
font-weight: 400;
line-height: 1.4;
color: var(--secondary-text-color);
}
.wl-label--grow {
flex: 1;
min-width: 0;
}
.wl-note {
font-size: 0.71875rem;
font-weight: 400;
line-height: 1.5;
color: var(--secondary-text-color);
}
.wl-divide {
padding-top: 12px;
border-top: 1px solid var(--divider-color);
}
.wl-chips {
display: flex;
flex-wrap: wrap;
gap: 7px;
}
.wl-chip {
--wl-chip-color: var(--primary-color);
--wl-chip-text: var(--primary-text-color);
--wl-chip-ink: #fff;
position: relative;
display: flex;
align-items: center;
gap: 5px;
height: 34px;
padding: 0 10px;
border-radius: 5px;
border: 2px solid var(--wl-chip-text);
background: transparent;
color: var(--wl-chip-text);
font-size: 0.8125rem;
font-weight: 700;
line-height: 1;
white-space: nowrap;
cursor: pointer;
forced-color-adjust: none;
}
.wl-chip::before {
content: "";
position: absolute;
left: 0;
right: 0;
top: -5px;
bottom: -5px;
}
.wl-chip[aria-pressed="true"] {
background: var(--wl-chip-color);
border-color: var(--wl-chip-color);
color: var(--wl-chip-ink);
}
.wl-chip:hover {
background: color-mix(in srgb, var(--wl-chip-color) 16%, transparent);
}
.wl-chip[aria-pressed="true"]:hover {
background: color-mix(in srgb, var(--wl-chip-color) 88%, #000);
}
.wl-chip:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
.wl-chip-mode {
font-size: 0.6875rem;
font-weight: 700;
line-height: 1;
opacity: 0.85;
}
.wl-chip-mode ha-icon {
--mdc-icon-size: 14px;
display: block;
}
.wl-badge {
--wl-chip-ink: #fff;
flex: none;
min-width: 34px;
height: 24px;
padding: 0 7px;
box-sizing: border-box;
border-radius: 5px;
color: var(--wl-chip-ink);
font-size: 0.75rem;
font-weight: 700;
line-height: 24px;
text-align: center;
forced-color-adjust: none;
}
.wl-dirs {
display: flex;
gap: 6px;
flex-wrap: wrap;
}
.wl-dir {
flex: 1;
min-width: 0;
min-height: 34px;
padding: 4px 9px;
border-radius: 6px;
border: 1px solid var(--divider-color);
background: var(--card-background-color);
color: var(--primary-text-color);
font-size: 0.78125rem;
font-weight: 500;
line-height: 1.3;
text-align: center;
overflow-wrap: anywhere;
cursor: pointer;
}
.wl-dir[aria-pressed="true"] {
border-color: var(--primary-color);
background: var(--wl-ripple);
color: var(--primary-color);
}
.wl-dir:hover:not([aria-disabled="true"]) {
background: var(--wl-hover);
}
.wl-dir[aria-disabled="true"] {
border-style: dashed;
background: transparent;
color: var(--secondary-text-color);
opacity: 0.65;
cursor: not-allowed;
}
.wl-dir:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
.wl-dir--compact {
flex: 1 1 0;
min-width: 44px;
}
.wl-dir--compact ha-icon {
--mdc-icon-size: 16px;
}
.wl-override-row {
display: flex;
align-items: center;
gap: 8px;
flex-wrap: wrap;
}
.wl-override-row .wl-dirs {
flex: 1;
min-width: 0;
gap: 5px;
}
.wl-walk-list {
display: flex;
flex-direction: column;
gap: 6px;
}
.wl-walk-row {
display: flex;
align-items: center;
gap: 8px;
min-height: 44px;
}
.wl-walk-dest {
flex: 1;
min-width: 0;
font-size: 0.8125rem;
font-weight: 400;
line-height: 1.35;
color: var(--primary-text-color);
overflow-wrap: anywhere;
}
.wl-stepper {
display: flex;
align-items: center;
flex: none;
border: 1px solid var(--divider-color);
border-radius: 6px;
overflow: hidden;
background: var(--card-background-color);
}
.wl-step-btn {
width: 34px;
height: 36px;
display: flex;
align-items: center;
justify-content: center;
border: 0;
background: transparent;
color: var(--secondary-text-color);
cursor: pointer;
}
.wl-step-btn ha-icon {
--mdc-icon-size: 18px;
}
.wl-step-btn:hover:not(:disabled) {
background: var(--wl-hover);
}
.wl-step-btn:disabled {
opacity: 0.4;
cursor: not-allowed;
}
.wl-step-btn:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: -2px;
}
.wl-step-value {
width: 38px;
box-sizing: border-box;
padding: 0 2px;
border: 0;
border-left: 1px solid var(--divider-color);
border-right: 1px solid var(--divider-color);
background: transparent;
color: var(--primary-text-color);
font-size: 0.84375rem;
font-weight: 500;
line-height: 36px;
text-align: center;
font-variant-numeric: tabular-nums;
-moz-appearance: textfield;
appearance: textfield;
}
.wl-step-value::-webkit-outer-spin-button,
.wl-step-value::-webkit-inner-spin-button {
-webkit-appearance: none;
margin: 0;
}
.wl-step-value:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: -2px;
}
.wl-color-row {
display: flex;
align-items: center;
gap: 8px;
width: 100%;
}
.wl-color-field {
position: relative;
flex: 1;
display: flex;
align-items: center;
gap: 8px;
min-height: 44px;
padding: 0 10px;
border: 1px solid var(--divider-color);
border-radius: 8px;
background: var(--card-background-color);
cursor: pointer;
}
.wl-swatch {
width: 22px;
height: 22px;
border-radius: 5px;
border: 1px solid var(--divider-color);
forced-color-adjust: none;
}
.wl-color-hex {
font-size: 0.78125rem;
line-height: 1;
font-family: ui-monospace, Menlo, monospace;
color: var(--primary-text-color);
}
.wl-color-input {
position: absolute;
inset: 0;
opacity: 0;
cursor: pointer;
}
.wl-color-field:focus-within {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
.wl-icon-btn {
flex: none;
width: 44px;
height: 44px;
display: flex;
align-items: center;
justify-content: center;
border: 1px solid var(--divider-color);
border-radius: 8px;
background: var(--card-background-color);
color: var(--secondary-text-color);
cursor: pointer;
}
.wl-icon-btn:hover:not(:disabled) {
background: var(--wl-hover);
}
.wl-icon-btn:disabled {
opacity: 0.45;
cursor: not-allowed;
}
.wl-icon-btn:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
.wl-stop-body {
padding: 12px;
display: flex;
flex-direction: column;
gap: 14px;
}
.wl-index {
flex: none;
width: 22px;
height: 22px;
box-sizing: border-box;
border-radius: 11px;
background: var(--card-background-color);
border: 1px solid var(--divider-color);
color: var(--secondary-text-color);
font-size: 0.6875rem;
font-weight: 600;
line-height: 20px;
text-align: center;
}
.wl-empty {
display: flex;
flex-direction: column;
gap: 4px;
align-items: center;
text-align: center;
padding: 18px 14px;
border: 1px dashed var(--divider-color);
border-radius: 8px;
background: var(--wl-sunken);
}
.wl-empty-title {
font-size: 0.8125rem;
font-weight: 500;
line-height: 1.4;
color: var(--primary-text-color);
}
.wl-add {
display: flex;
align-items: center;
justify-content: center;
gap: 8px;
min-height: 44px;
border: 1px dashed var(--divider-color);
border-radius: 10px;
background: transparent;
color: var(--primary-color);
font-size: 0.84375rem;
font-weight: 500;
line-height: 1;
cursor: pointer;
}
.wl-add:hover {
background: var(--wl-hover);
}
.wl-add:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
@media (forced-colors: active) {
.wl-chip,
.wl-badge,
.wl-swatch {
outline: 1px solid CanvasText;
}
.wl-chip[aria-pressed="true"]:not(:focus-visible),
.wl-dir[aria-pressed="true"]:not(:focus-visible) {
outline: 2px solid Highlight;
outline-offset: -2px;
}
}`,bn=c`:host {
--wl-sunken: color-mix(in srgb, var(--primary-text-color) 3%, var(--card-background-color));
--wl-hover: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
--wl-ripple: color-mix(in srgb, var(--primary-color) 14%, transparent);
}`,xn=c`:host {
--wl-signage-housing: #0d0d0d;
--wl-signage-selected: #171717;
--wl-signage-outline: #3a3a3a;
--wl-signage-chip: #2a2a2a;
--wl-signage-ink: #f2f2f2;
}
.wl-strip {
display: flex;
flex-direction: column;
gap: 10px;
padding: 8px 0 4px;
}
.wl-strip-bar {
display: flex;
gap: 6px;
padding: 8px;
border-radius: 10px;
background: var(--wl-signage-housing);
border: 1px solid var(--divider-color);
}
.wl-zone {
flex: 1;
min-width: 0;
display: flex;
align-items: center;
min-height: 44px;
padding: 6px 8px;
border-radius: 6px;
border: 1px dashed var(--wl-signage-outline);
background: transparent;
cursor: pointer;
}
.wl-zone--selected {
border: 2px solid var(--primary-color);
background: var(--wl-signage-selected);
}
.wl-zone:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
.wl-zone-tokens {
display: flex;
flex-wrap: wrap;
gap: 5px;
align-items: center;
width: 100%;
}
.wl-zone--right .wl-zone-tokens {
justify-content: flex-end;
}
.wl-token {
display: flex;
align-items: center;
height: 22px;
padding: 0 6px;
border-radius: 3px;
color: var(--wl-signage-ink);
font-size: 0.6875rem;
font-weight: 400;
line-height: 1;
white-space: nowrap;
forced-color-adjust: none;
}
.wl-token ha-icon {
--mdc-icon-size: 16px;
}
.wl-token--chip {
background: var(--wl-signage-chip);
}
.wl-strip-switch {
display: flex;
align-items: center;
gap: 8px;
}
.wl-seg {
display: flex;
gap: 4px;
padding: 3px;
background: var(--secondary-background-color);
border-radius: 8px;
}
.wl-seg-btn {
border: 0;
cursor: pointer;
padding: 8px 12px;
min-height: 34px;
border-radius: 6px;
background: transparent;
color: var(--secondary-text-color);
font-size: 0.78125rem;
font-weight: 500;
line-height: 1.2;
}
.wl-seg-btn[aria-pressed="true"] {
background: var(--card-background-color);
color: var(--primary-color);
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.14);
}
.wl-seg-btn:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
.wl-slot {
display: flex;
flex-direction: column;
gap: 12px;
padding: 12px;
border: 1px solid var(--primary-color);
border-radius: 10px;
background: var(--wl-sunken);
}
.wl-pict-grid,
.wl-tray {
display: flex;
flex-wrap: wrap;
gap: 6px;
}
.wl-pict {
width: 44px;
height: 44px;
display: flex;
align-items: center;
justify-content: center;
border: 1px solid var(--divider-color);
border-radius: 8px;
background: var(--card-background-color);
color: var(--primary-text-color);
cursor: pointer;
}
.wl-pict ha-icon,
.wl-tray-btn ha-icon,
.wl-pill ha-icon {
--mdc-icon-size: 18px;
}
.wl-pict[aria-pressed="true"],
.wl-tray-btn[aria-pressed="true"] {
border-color: var(--primary-color);
background: var(--wl-ripple);
color: var(--primary-color);
}
.wl-pict:hover,
.wl-tray-btn:hover {
background: var(--wl-hover);
}
.wl-pict:focus-visible,
.wl-tray-btn:focus-visible,
.wl-pill-x:focus-visible,
.wl-text:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
.wl-tray-btn {
display: flex;
align-items: center;
gap: 6px;
min-height: 44px;
padding: 0 12px;
border: 1px solid var(--divider-color);
border-radius: 8px;
background: var(--card-background-color);
color: var(--primary-text-color);
font-size: 0.78125rem;
font-weight: 500;
line-height: 1;
cursor: pointer;
}
.wl-text {
width: 100%;
box-sizing: border-box;
min-height: 44px;
padding: 0 12px;
border: 1px solid var(--divider-color);
border-radius: 8px;
background: var(--card-background-color);
color: var(--primary-text-color);
font-size: 0.8125rem;
line-height: 1.4;
}
.wl-pill {
display: flex;
align-items: center;
gap: 6px;
min-height: 36px;
padding: 0 6px 0 11px;
border: 1px solid var(--divider-color);
border-radius: 18px;
background: var(--card-background-color);
color: var(--primary-text-color);
font-size: 0.78125rem;
line-height: 1;
}
.wl-pill-x {
width: 24px;
height: 24px;
display: flex;
align-items: center;
justify-content: center;
border: 0;
border-radius: 12px;
background: var(--wl-hover);
color: var(--secondary-text-color);
cursor: pointer;
}
.wl-pill-x ha-icon {
--mdc-icon-size: 14px;
}
@media (forced-colors: active) {
.wl-strip-bar,
.wl-zone {
forced-color-adjust: none;
}
.wl-strip-bar {
outline: 1px solid CanvasText;
}
.wl-seg-btn[aria-pressed="true"]:not(:focus-visible),
.wl-pict[aria-pressed="true"]:not(:focus-visible),
.wl-tray-btn[aria-pressed="true"]:not(:focus-visible) {
outline: 2px solid Highlight;
outline-offset: -2px;
}
}`;function Sn(e,t){let n={hassLanguage:t};return{t:t=>at(`${e}.${t}`,n),et:t=>{let r=`${e}.editor.${t}`,i=at(r,n);if(i!==r)return i;let a=`common.editor.${t}`,o=at(a,n);return o===a?t:o}}}function Cn(e,t,n){let r=(t,r)=>{let i=t.key===`ArrowRight`?1:t.key===`ArrowLeft`?-1:0;if(!i)return;t.preventDefault();let a=(r+i+e.length)%e.length,o=e[a];if(!o)return;n(o.key);let s=t.currentTarget.parentElement?.children[a];s instanceof HTMLElement&&s.focus()};return F`
    <div class="wl-tabs" role="tablist">
      ${e.map((e,i)=>F`<button
          type="button"
          class="wl-tab"
          role="tab"
          id=${`wl-tab-${e.key}`}
          aria-selected=${t===e.key?`true`:`false`}
          aria-controls=${t===e.key?`wl-panel-${e.key}`:L}
          tabindex=${t===e.key?`0`:`-1`}
          @click=${()=>n(e.key)}
          @keydown=${e=>r(e,i)}
        >
          <span class="wl-tab-label">${e.label}</span>
          <span class="wl-tab-underline" aria-hidden="true"></span>
        </button>`)}
    </div>
  `}function wn(e,t){return F`
    <div
      class=${e===`stops`?`wl-panel wl-panel--stops`:`wl-panel`}
      role="tabpanel"
      id=${`wl-panel-${e}`}
      aria-labelledby=${`wl-tab-${e}`}
    >
      ${t}
    </div>
  `}function Tn(e,t){return F`
    <section class="wl-section">
      <header class="wl-section-header">
        <span class="wl-section-title">${e.title}</span>
        ${e.hint?F`<span class="wl-section-hint">${e.hint}</span>`:L}
      </header>
      <div class="wl-section-body">${t}</div>
    </section>
  `}function En(e){return Tn(e,F`<ha-form
      .hass=${e.hass}
      .data=${e.data}
      .schema=${e.schema}
      .computeLabel=${e.computeLabel}
      .computeHelper=${e.computeHelper}
      @value-changed=${t=>{t.stopPropagation(),e.onChange(t.detail.value)}}
    ></ha-form>`)}
/**
* @license
* Copyright 2020 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/const Dn=Ne(class extends Pe{constructor(e){if(super(e),e.type!==U.PROPERTY&&e.type!==U.ATTRIBUTE&&e.type!==U.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!Ie(e))throw Error("`live` bindings can only contain a single expression")}render(e){return e}update(e,[t]){if(t===I||t===L)return t;let n=e.element,r=e.name;if(e.type===U.PROPERTY){if(t===n[r])return I}else if(e.type===U.BOOLEAN_ATTRIBUTE){if(!!t===n.hasAttribute(r))return I}else if(e.type===U.ATTRIBUTE&&n.getAttribute(r)===t+``)return I;return Re(e),t}});function Y(e){e.key!==`Escape`&&e.key!==`Tab`&&e.stopPropagation()}function On(e,t){let n=e.trim(),r=n===``?NaN:Number(n);return n!==``&&!Number.isFinite(r)&&console.warn(`[wiener-linien-austria] walk-time "${e}" for ${t} is not a number — clearing`),Number.isFinite(r)&&r>0?Math.min(120,Math.round(r)):null}const kn=[{key:`show_wc`,icon:`mdi:human-male-female`,labelKey:`show_wc_short`},{key:`show_escalator`,icon:`mdi:escalator`,labelKey:`show_escalator_short`},{key:`show_elevator`,icon:`mdi:elevator`,labelKey:`show_elevator_short`},{key:`show_clock`,icon:`mdi:clock-outline`,labelKey:`show_clock_short`},{key:`show_date`,icon:`mdi:calendar`,labelKey:`show_date_short`}],An=[{value:`regular`,icon:`mdi:exit-run`,labelKey:`header_exit_regular`},{value:`accessible`,icon:`mdi:wheelchair-accessibility`,labelKey:`header_exit_accessible`},...bt.map(e=>({value:e,icon:e,labelKey:xt[e].labelKey})),{value:`none`,icon:`mdi:close-circle-outline`,labelKey:`header_exit_none`}];function jn(e,t,n){let r=[];if(!e)return[{label:t,kind:`text`,name:t}];if(e.exit&&e.exit!==`none`){let t=An.find(t=>t.value===e.exit);r.push({label:``,icon:t?.icon??e.exit,kind:`icon`,name:t?n(t.labelKey):e.exit})}e.text&&r.push({label:e.text,kind:`text`,name:e.text});for(let t of kn)e[t.key]&&r.push({label:``,icon:t.icon,kind:`icon`,name:n(t.labelKey)});for(let t of e.extra_icons??[])r.push({label:``,icon:t,kind:`icon`,name:t});for(let t of e.chips??[])r.push({label:t,kind:`chip`,name:t});return r.length||r.push({label:t,kind:`text`,name:t}),r}function Mn(e,t){let n=(e.selected===`header_left`?e.left:e.right)??{},r=e.et(`header_slot_empty`),i=(n,r)=>t.patch(e.selected,n,r);return F`
    <div class="wl-strip">
      <div class="wl-strip-bar" role="group" aria-label=${e.et(`header_bar_aria`)}>
        ${Nn(`header_left`,e,t,r)}
        ${Nn(`header_right`,e,t,r)}
      </div>

      <div class="wl-strip-switch">
        <span class="wl-note wl-label--grow">${e.et(`header_pick_side_hint`)}</span>
        <div class="wl-seg" role="group" aria-label=${e.et(`header_side_aria`)}>
          ${[`header_left`,`header_right`].map(n=>F`<button
              type="button"
              class="wl-seg-btn"
              aria-pressed=${e.selected===n?`true`:`false`}
              @click=${()=>t.selectSide(n)}
            >
              ${e.et(n===`header_left`?`header_left`:`header_right`)}
            </button>`)}
        </div>
      </div>

      <div class="wl-slot">
        <div class="wl-group">
          <span class="wl-label">${e.et(`exit`)}</span>
          <div class="wl-pict-grid">
            ${An.map(t=>{let r=(n.exit??`none`)===t.value,a=e.et(t.labelKey);return F`<button
                type="button"
                class="wl-pict"
                aria-pressed=${r?`true`:`false`}
                aria-label=${a}
                title=${a}
                @click=${()=>i(`exit`,t.value)}
              >
                <ha-icon icon=${t.icon} aria-hidden="true"></ha-icon>
              </button>`})}
          </div>
        </div>

        <div class="wl-group">
          <span class="wl-label">${e.et(`text`)}</span>
          <input
            type="text"
            class="wl-text"
            maxlength=${64}
            .value=${n.text??``}
            aria-label=${e.et(`text`)}
            placeholder=${e.et(`text_placeholder`)}
            @keydown=${Y}
            @keyup=${Y}
            @keypress=${Y}
            @change=${e=>i(`text`,e.target.value.trim()||void 0)}
          />
        </div>

        <div class="wl-group">
          <span class="wl-label">${e.et(`header_amenities`)}</span>
          <div class="wl-tray">
            ${kn.map(t=>{let r=!!n[t.key],a=e.et(t.labelKey);return F`<button
                type="button"
                class="wl-tray-btn"
                aria-pressed=${r?`true`:`false`}
                aria-label=${a}
                @click=${()=>i(t.key,!r)}
              >
                <ha-icon icon=${t.icon} aria-hidden="true"></ha-icon>
                ${a}
              </button>`})}
          </div>
          ${n.show_date?F`<input
                type="text"
                class="wl-text"
                maxlength=${32}
                .value=${n.date_format??``}
                aria-label=${e.et(`date_format`)}
                placeholder=${e.et(`date_format_placeholder`)}
                @keydown=${Y}
                @keyup=${Y}
                @keypress=${Y}
                @change=${e=>i(`date_format`,e.target.value.trim()||void 0)}
              />`:L}
        </div>

        ${Pn(n,e,i)}
      </div>
    </div>
  `}function Nn(e,t,n,r){let i=e===`header_left`?t.left:t.right,a=t.selected===e,o=jn(i,r,t.et),s=t.et(e===`header_left`?`header_left`:`header_right`);return F`<button
    type="button"
    class=${W({"wl-zone":!0,"wl-zone--selected":a,"wl-zone--right":e===`header_right`})}
    aria-pressed=${a?`true`:`false`}
    aria-label=${`${s}: ${o.map(e=>e.name).join(`, `)}`}
    @click=${()=>n.selectSide(e)}
  >
    <span class="wl-zone-tokens">
      ${o.map(e=>F`<span
          class=${W({"wl-token":!0,"wl-token--chip":e.kind===`chip`})}
          >${e.icon?F`<ha-icon icon=${e.icon} aria-hidden="true"></ha-icon>`:e.label}</span
        >`)}
    </span>
  </button>`}function Pn(e,t,n){let r=e.chips??[],i=e.extra_icons??[];return F`
    <div class="wl-group">
      <span class="wl-label"
        >${t.et(`header_chips_and_icons`).replace(`{chips}`,`6`).replace(`{icons}`,`3`)}</span
      >
      <div class="wl-tray">
        ${i.map((e,r)=>F`<span class="wl-pill">
            <ha-icon icon=${e} aria-hidden="true"></ha-icon>
            <button
              type="button"
              class="wl-pill-x"
              aria-label=${t.et(`remove_icon_aria`).replace(`{icon}`,e)}
              @click=${()=>n(`extra_icons`,Fn(i,r))}
            >
              <ha-icon icon="mdi:close" aria-hidden="true"></ha-icon>
            </button>
          </span>`)}
        ${r.map((e,i)=>F`<span class="wl-pill">
            ${e}
            <button
              type="button"
              class="wl-pill-x"
              aria-label=${t.et(`remove_chip_aria`).replace(`{chip}`,e)}
              @click=${()=>n(`chips`,Fn(r,i))}
            >
              <ha-icon icon="mdi:close" aria-hidden="true"></ha-icon>
            </button>
          </span>`)}
      </div>

      ${i.length<3?F`<ha-icon-picker
            .value=${Dn(``)}
            .label=${t.et(`add_icon`)}
            @value-changed=${e=>{let t=e.detail?.value;t&&n(`extra_icons`,[...i,t].slice(0,3))}}
          ></ha-icon-picker>`:L}
      ${r.length<6?F`<input
            type="text"
            class="wl-text"
            maxlength=${16}
            aria-label=${t.et(`add_chip`)}
            placeholder=${t.et(`add_chip`)}
            @keydown=${e=>{if(Y(e),e.key!==`Enter`)return;let t=e.target,i=t.value.trim();i&&(n(`chips`,[...r,i].slice(0,6)),t.value=``)}}
            @keyup=${Y}
            @keypress=${Y}
          />`:L}
    </div>
  `}function Fn(e,t){let n=e.filter((e,n)=>n!==t);return n.length?n:void 0}function In(e){return{"--wl-chip-color":e.fill,...e.text?{"--wl-chip-text":e.text}:{},...e.ink?{"--wl-chip-ink":e.ink}:{}}}function Ln(e){return{background:e.fill,...e.ink?{"--wl-chip-ink":e.ink}:{}}}function Rn(e,t){return e?.states?.[t]?.attributes}function zn(e,t,n){let r=new Set;for(let i of e)i.direction===t&&(n&&i.line!==n||i.towards&&r.add(i.towards));return[...r].sort()}function Bn(e,t){return!e.singleLine&&Jt(t.lines,t.picked).length>=2}function Vn(e,t,n,r){let i=Rn(e,t.entity),a=!i,o=i?.stop_name||t.entity,s=i?.line_colors??{},c=ut(e),l=e=>Vt(e,n.lineColorOverrides,s,c,`#5b6470`),u=new Set(t.lines??[]),d=Yt(i),f=u.size?[...new Set([...d,...u])].sort():d,p=Ut(i),m=new Map;for(let e of i?.departures??[])e.line&&e.type&&!m.has(e.line)&&m.set(e.line,e.type);let h=e=>({full:n.t(e===`H`?`dir_h`:`dir_r`),short:n.t(e===`H`?`dir_h_short`:`dir_r_short`)});return F`
    <section class="wl-section">
      <header class="wl-section-header">
        ${n.total>1?F`<span class="wl-index" aria-hidden="true">${n.index}</span>`:L}
        <span class="wl-section-title">${o}</span>
      </header>
      <div class="wl-stop-body">
        ${a?Hn(t,n,r):L}
        ${Un(t,n,r,{lines:f,picked:u,colorOf:l,typeByLine:m})}
        ${!a&&f.length?Bn(n,{lines:f,picked:u})?Gn(t,n,r,{attrs:i,triplets:p,picked:u,lines:f,colorOf:l,dirStrings:h}):Wn(t,n,r,{attrs:i,triplets:p,picked:u,lines:f,dirStrings:h}):L}
        ${a?L:Kn(t,n,r,{attrs:i,picked:u,colorOf:l,lines:f,dirStrings:h})}
      </div>
    </section>
  `}function Hn(e,t,n){return F`
    <ha-alert alert-type="error">
      ${t.t(`entity_missing`).replace(`{entity}`,e.entity)}
      ${n.remove?F`<button
            type="button"
            slot="action"
            class="wl-add"
            @click=${()=>n.remove?.(e.entity)}
          >
            ${t.et(`remove_stop`)}
          </button>`:L}
    </ha-alert>
  `}function Un(e,t,n,r){let{lines:i,picked:a,colorOf:o,typeByLine:s}=r,c=a.size?t.et(`lines_selected`).replace(`{n}`,String(a.size)).replace(`{total}`,String(i.length)):t.et(`lines_empty_means_all`);return F`
    <div class="wl-group">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${t.et(`lines_label`)}</span>
        ${i.length?F`<span class="wl-note">${c}</span>`:L}
      </div>
      ${i.length?F`<div class="wl-chips">
            ${i.map(r=>{let i=t.singleLine?a.has(r):a.size===0||a.has(r),c=$t(s.get(r));return F`<button
                type="button"
                class="wl-chip"
                style=${G(In(o(r)))}
                aria-pressed=${i?`true`:`false`}
                aria-label=${t.et(i?`line_active_aria`:`line_inactive_aria`).replace(`{line}`,r)}
                @click=${()=>n.toggleLine(e.entity,r)}
              >
                ${c?F`<span class="wl-chip-mode"
                      ><ha-icon icon=${c} aria-hidden="true"></ha-icon
                    ></span>`:L}
                ${r}
              </button>`})}
          </div>`:F`<div class="wl-empty">
            <span class="wl-empty-title">${t.et(`no_lines_title`)}</span>
            <span class="wl-note">${t.et(`no_lines_hint`)}</span>
          </div>`}
    </div>
  `}function Wn(e,t,n,r){let{attrs:i,triplets:a,picked:o,lines:s,dirStrings:c}=r,l=Jt(s,o),u=l.length===1?l[0]:void 0,d=e.direction??null,f=qt(i,u),p=f.available.has(`H`),m=f.available.has(`R`),h=f.oneWay!==null,g=d===`H`||d===null&&f.oneWay===`H`,_=d===`R`||d===null&&f.oneWay===`R`,v=d===null&&!h,y=t=>{let r={};for(let[t,n]of Object.entries(e.line_directions??{}))l.includes(t)||(r[t]=n);n.setDirections(e.entity,{direction:t,lineDirections:r})},b=e=>f.unknown||f.available.has(e)?Gt(zn(a,e,u),c(e)):`${c(e).short}: ${t.et(`direction_not_served`)}`,x=f.oneWay!==null&&l.length===1?t.et(`direction_note_one_way`).replace(`{line}`,l[0]??``):``;return F`
    <div class="wl-group">
      <span class="wl-label">${t.et(`direction_label`)}</span>
      <div class="wl-dirs">
        ${X({label:b(`H`),active:g,disabled:!f.unknown&&!p,title:p||f.unknown?t.t(`dir_h`):t.et(`direction_unavailable`),onClick:()=>y(`H`)})}
        ${X({label:b(`R`),active:_,disabled:!f.unknown&&!m,title:m||f.unknown?t.t(`dir_r`):t.et(`direction_unavailable`),onClick:()=>y(`R`)})}
        ${t.singleLine?L:X({label:t.t(`dir_both`),active:v,disabled:h,title:h?t.et(`direction_unavailable`):t.t(`dir_both`),onClick:()=>y(null)})}
      </div>
      ${x?F`<span class="wl-note">${x}</span>`:L}
    </div>
  `}function X(e){return F`<button
    type="button"
    class=${W({"wl-dir":!0,"wl-dir--compact":!!e.compact})}
    aria-pressed=${e.active?`true`:`false`}
    aria-disabled=${e.disabled?`true`:`false`}
    aria-label=${e.ariaLabel??e.label}
    title=${e.title}
    @click=${t=>{if(e.disabled){t.preventDefault();return}e.onClick()}}
  >
    ${e.icon?F`<ha-icon icon=${e.icon} aria-hidden="true"></ha-icon>`:e.label}
  </button>`}function Gn(e,t,n,r){let{attrs:i,triplets:a,picked:o,lines:s,colorOf:c,dirStrings:l}=r,u=Jt(s,o),d=e.line_directions??{},f=e.direction??null,p=e=>d[e]??f,m=(t,r)=>{let i={};for(let e of u){let n=e===t?r:p(e);n&&(i[e]=n)}for(let[e,t]of Object.entries(d))u.includes(e)||(i[e]=t);n.setDirections(e.entity,{direction:null,lineDirections:i})};return F`
    <div class="wl-group">
      <span class="wl-label">${t.et(`direction_label`)}</span>
      ${u.map(e=>{let n=qt(i,e),r=p(e),o=n.available.has(`H`),s=n.available.has(`R`),u=n.oneWay!==null,d=n.unknown,f=n=>t.et(`per_line_direction_aria`).replace(`{line}`,e).replace(`{direction}`,n===null?t.t(`dir_both`):Gt(zn(a,n,e),l(n)));return F`
          <div class="wl-override-row">
            <span class="wl-badge" style=${G(Ln(c(e)))}
              >${e}</span
            >
            <div class="wl-dirs">
              ${X({label:l(`H`).short,active:r===`H`||r===null&&n.oneWay===`H`,disabled:!d&&!o,compact:!0,title:zn(a,`H`,e).join(` / `)||t.t(`dir_h`),ariaLabel:f(`H`),onClick:()=>m(e,`H`)})}
              ${X({label:l(`R`).short,active:r===`R`||r===null&&n.oneWay===`R`,disabled:!d&&!s,compact:!0,title:zn(a,`R`,e).join(` / `)||t.t(`dir_r`),ariaLabel:f(`R`),onClick:()=>m(e,`R`)})}
              ${X({label:``,icon:`mdi:swap-horizontal`,active:r===null&&!u,disabled:u,compact:!0,title:t.t(`dir_both`),ariaLabel:f(null),onClick:()=>m(e,null)})}
            </div>
          </div>
        `})}
    </div>
  `}function Kn(e,t,n,r){let{attrs:i,picked:a,colorOf:o,lines:s,dirStrings:c}=r,l=Zt(i,{lines:s,picked:a,lineDirections:e.line_directions??{},stopDirection:e.direction??null});return l.length?F`
    <div class="wl-group wl-divide">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${t.et(`section_walk_time`)}</span>
        <span class="wl-note">${t.et(`walk_time_unit`)}</span>
      </div>
      <span class="wl-note">${t.et(`walk_time_hint`)}</span>
      <div class="wl-walk-list">
        ${l.map(r=>{let i=Ht(r.line,r.direction),a=e.walk_times?.[i],s=r.termini.length?r.termini.join(` / `):r.direction===`H`||r.direction===`R`?c(r.direction).full:``,l=t.et(`walk_time_aria`).replace(`{line}`,r.line).replace(`{towards}`,s),u=t=>{let r=(a??0)+t;n.setWalkTime(e.entity,i,r<1?null:Math.min(120,r))};return F`
            <div class="wl-walk-row">
              <span class="wl-badge" style=${G(Ln(o(r.line)))}
                >${r.line}</span
              >
              <span
                class="wl-walk-dest"
                title=${r.termini.length>1?t.et(`walk_time_branching_hint`):s}
                >→ ${s}</span
              >
              <span class="wl-stepper">
                <button
                  type="button"
                  class="wl-step-btn"
                  ?disabled=${a===void 0}
                  aria-label=${t.et(`walk_time_less_aria`).replace(`{line}`,r.line)}
                  @click=${()=>u(-1)}
                >
                  <ha-icon icon="mdi:minus" aria-hidden="true"></ha-icon>
                </button>
                <input
                  type="number"
                  class="wl-step-value"
                  min=${1}
                  max=${120}
                  step="1"
                  inputmode="numeric"
                  placeholder=${t.et(`walk_time_placeholder`)}
                  aria-label=${l}
                  .value=${Dn(a===void 0?``:String(a))}
                  @keydown=${Y}
                  @keyup=${Y}
                  @keypress=${Y}
                  @change=${t=>n.setWalkTime(e.entity,i,On(t.target.value,`${e.entity}/${i}`))}
                />
                <button
                  type="button"
                  class="wl-step-btn"
                  ?disabled=${(a??0)>=120}
                  aria-label=${t.et(`walk_time_more_aria`).replace(`{line}`,r.line)}
                  @click=${()=>u(1)}
                >
                  <ha-icon icon="mdi:plus" aria-hidden="true"></ha-icon>
                </button>
              </span>
            </div>
          `})}
      </div>
    </div>
  `:L}function qn(e,t,n){let r={...e??{},[t]:n};return n===void 0&&delete r[t],r}function Jn(e,t,n){let r=t.et(n);return r===n?e?.localize?.(`ui.panel.lovelace.editor.card.generic.${n}`)||n:r}function Yn(e,t,n){let r=n?.[t];if(r!==void 0)return r;let i=`${t}_helper`,a=e.et(i);return a===i?void 0:a}function Z(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}let Q=class extends V{constructor(...e){super(...e),this._tab=`stops`,this._headerSide=`header_left`,this._pendingDirectionFix=!1,this._onEntityChanged=e=>{if(e.stopPropagation(),!this._config)return;let t=e.detail.value.entity,n=typeof t==`string`?t:void 0;if(n===this._config.entity)return;let r={...this._config,entity:n},i=this._availableDirections(n);i.size===1&&(r.direction=i.has(`H`)?`H`:`R`),r.line=Kt(this._attrs(n),r.direction)[0],this._commit(r)},this._computeLabel=e=>Jn(this.hass,this._i18n,e.name),this._computeHelper=e=>{let{et:t}=this._i18n;return Yn(this._i18n,e.name,{...this._config?.message_ticker?{}:{message_text:t(`message_text_requires`)},...this._config?.show_platform?{}:{platform_side:t(`platform_side_requires`)}})}}setConfig(e){this._config=zt(e)}shouldUpdate(e){if(!this._config)return!1;if(e.has(`_config`)||e.has(`_tab`)||e.has(`_headerSide`))return!0;let t=e.get(`hass`);if(!t||!this.hass)return!0;let n=this._config.entity;return!n||t.states[n]!==this.hass.states[n]}willUpdate(e){(e.has(`_config`)||e.has(`hass`))&&this._scheduleDirectionAutocorrect()}get _i18n(){return Sn(`retro`,this.hass?.language)}_attrs(e){return e?this.hass?.states?.[e]?.attributes:void 0}_commit(e){this._config=e,Ve(this,`config-changed`,{config:e})}_patch(e){this._config&&this._commit(zt({...this._config,...e}))}get _stopView(){let e=this._config;return{entity:e.entity??``,lines:e.line?[e.line]:[],direction:e.direction,walk_times:e.walk_times}}get _stopCallbacks(){return{toggleLine:(e,t)=>{if(!this._config)return;let n={...this._config};n.line===t?delete n.line:n.line=t,this._commit(n)},setDirections:(e,t)=>{if(!this._config||t.direction===null)return;let n={...this._config,direction:t.direction},r=Kt(this._attrs(n.entity),t.direction);(!n.line||!r.includes(n.line))&&(n.line=r[0]),this._commit(n)},setWalkTime:(e,t,n)=>{if(!this._config)return;let r={...this._config.walk_times??{}};n===null?delete r[t]:r[t]=n;let i={...this._config};Object.keys(r).length?i.walk_times=r:delete i.walk_times,this._commit(i)}}}render(){if(!this._config)return L;let{et:e}=this._i18n;return F`
      <div class="wl-editor">
        ${Cn([{key:`stops`,label:e(`tab_stop`)},{key:`display`,label:e(`tab_display`)},{key:`tweaks`,label:e(`tab_tweaks`)}],this._tab,e=>{this._tab=e})}
        ${wn(this._tab,this._renderActiveTab())}
      </div>
    `}_renderActiveTab(){switch(this._tab){case`stops`:return this._renderStop();case`display`:return this._renderDisplay();case`tweaks`:return this._renderTweaks()}}_renderStop(){let e=this._config,{t,et:n}=this._i18n;return F`
      <ha-form
        .hass=${this.hass}
        .data=${{entity:e.entity}}
        .schema=${[{name:`entity`,required:!0,selector:{entity:{filter:{domain:`sensor`,integration:`wiener_linien_austria`}}}}]}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._onEntityChanged}
      ></ha-form>
      ${e.entity?Vn(this.hass,this._stopView,{index:1,total:1,singleLine:!0,lineColorOverrides:{},t,et:n},this._stopCallbacks):L}
    `}_renderDisplay(){let e=this._config,{et:t}=this._i18n,n={hass:this.hass,computeLabel:this._computeLabel,computeHelper:this._computeHelper,onChange:e=>this._patch(e)};return F`
      ${Tn({title:t(`section_header`),hint:t(`section_header_hint`)},F`
          <ha-form
            .hass=${this.hass}
            .data=${{show_header:e.show_header}}
            .schema=${[{name:`show_header`,selector:{boolean:{}}}]}
            .computeLabel=${this._computeLabel}
            .computeHelper=${this._computeHelper}
            @value-changed=${e=>{e.stopPropagation(),this._patch(e.detail.value)}}
          ></ha-form>
          ${e.show_header?Mn({left:e.header_left,right:e.header_right,selected:this._headerSide,et:t},{selectSide:e=>{this._headerSide=e},patch:(e,t,n)=>this._patchHeaderSide(e,t,n)}):L}
        `)}
      ${En({...n,title:t(`section_station`),data:{show_station_name:e.show_station_name,station_bg:e.station_bg},schema:[{name:`show_station_name`,selector:{boolean:{}}},{name:`station_bg`,selector:{select:{mode:`dropdown`,options:[{value:`default`,label:t(`station_bg_default`)},{value:`white`,label:t(`station_bg_white`)},{value:`black`,label:t(`station_bg_black`)}]}}}]})}
      ${En({...n,title:t(`section_departure_row`),hint:t(`section_led_panel`),data:{show_platform:e.show_platform,platform_side:e.platform_side,accessibility_only:e.accessibility_only},schema:[{name:`show_platform`,selector:{boolean:{}}},{name:`platform_side`,disabled:!e.show_platform,selector:{select:{mode:`dropdown`,options:[{value:`auto`,label:t(`platform_side_auto`)},{value:`left`,label:t(`platform_side_left`)},{value:`right`,label:t(`platform_side_right`)}]}}},{name:`accessibility_only`,selector:{boolean:{}}}]})}
      ${En({...n,title:t(`section_extras`),hint:t(`section_extras_hint`),data:{message_ticker:e.message_ticker,message_text:e.message_text??``,wheelchair_race:e.wheelchair_race},schema:[{name:`message_ticker`,selector:{boolean:{}}},{name:`message_text`,disabled:!e.message_ticker,selector:{text:{}}},{name:`wheelchair_race`,selector:{boolean:{}}}]})}
    `}_renderTweaks(){let e=this._config,{et:t}=this._i18n,n={hass:this.hass,computeLabel:this._computeLabel,computeHelper:this._computeHelper,onChange:e=>this._patch(e)};return F`
      ${En({...n,title:t(`section_led_panel`),data:{size:e.size,style:e.style,show_unit:e.show_unit,show_line_pill:e.show_line_pill,line_stripe:e.line_stripe,housing:e.housing,flicker:e.flicker},schema:[{name:`size`,selector:{select:{mode:`dropdown`,options:[{value:`small`,label:t(`size_small`)},{value:`medium`,label:t(`size_medium`)},{value:`regular`,label:t(`size_regular`)}]}}},{name:`style`,selector:{select:{mode:`dropdown`,options:[{value:`classic`,label:t(`style_classic`)},{value:`warm`,label:t(`style_warm`)},{value:`pixel`,label:t(`style_pixel`)}]}}},{name:`show_unit`,selector:{boolean:{}}},{name:`show_line_pill`,selector:{boolean:{}}},{name:`line_stripe`,selector:{boolean:{}}},{name:`housing`,selector:{boolean:{}}},{name:`flicker`,selector:{boolean:{}}}]})}
    `}_patchHeaderSide(e,t,n){this._config&&this._patch({[e]:qn(this._config[e],t,n)})}_availableDirections(e=this._config?.entity){return qt(this._attrs(e)).available}_scheduleDirectionAutocorrect(){if(!this._config||this._pendingDirectionFix)return;let e=this._availableDirections();if(e.size!==1)return;let t=e.has(`H`)?`H`:`R`;this._config.direction!==t&&(this._pendingDirectionFix=!0,Promise.resolve().then(()=>{try{if(!this._config)return;let e=this._availableDirections();if(e.size!==1)return;let t=e.has(`H`)?`H`:`R`;if(this._config.direction===t)return;let n={...this._config,direction:t},r=Kt(this._attrs(n.entity),t);(!n.line||!r.includes(n.line))&&(n.line=r[0]),console.info(`[wiener-linien-austria-retro-card-editor] direction autocorrected to "${t}" for entity "${n.entity??``}" — only one direction has live data`),this._commit(n)}finally{this._pendingDirectionFix=!1}}))}static{this.styles=[bn,yn,xn]}};Z([Me({attribute:!1})],Q.prototype,`hass`,void 0),Z([H()],Q.prototype,`_config`,void 0),Z([H()],Q.prototype,`_tab`,void 0),Z([H()],Q.prototype,`_headerSide`,void 0),Q=Z([ke(`wiener-linien-austria-retro-card-editor`)],Q);const Xn=2400,Zn=3e5;{let e=window;e.customCards=e.customCards??[],e.customCards.some(e=>e.type===`wiener-linien-austria-retro-card`)||e.customCards.push({type:`wiener-linien-austria-retro-card`,name:`Wiener Linien Austria — Retro`,description:`LED-Anzeige im Stil der Wiener-Linien-Stationen`,preview:!0,getEntitySuggestion:(e,t)=>!t.startsWith(`sensor.`)||e?.entities?.[t]?.platform!==`wiener_linien_austria`?null:{config:{type:`custom:wiener-linien-austria-retro-card`,entity:t}}})}let $=class extends V{constructor(...e){super(...e),this._versionMismatch=null,this._raceState=`idle`,this._countdownDigit=null,this._raceWinner=null,this._tickerActive=!1,this._tickerTimer=null,this._viaPhase=`towards`,this._viaTimer=null,this._anyViaInRows=!1,this._versionCheckDone=!1,this._fallbackWarned=!1,this._cachedEid=null,this._raceTimers=new Set,this._countdownStartAt=null,this._raceEndAt=null,this._freezeEndAt=null,this._victoryEndAt=null,this._handleCardClick=()=>{if(this._tickerActive){this._tickerActive=!1,this._scheduleTicker(Zn);return}this._config?.wheelchair_race&&this._raceState===`idle`&&(typeof window<`u`&&window.matchMedia?.(`(prefers-reduced-motion: reduce)`).matches||(this._clearRaceTimers(),this._startRace()))},this._handleCardKeydown=e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),this._handleCardClick())},this._onTickerDone=()=>{this._tickerActive=!1,this._scheduleTicker(Zn)}}setConfig(e){if(!e||typeof e!=`object`)throw Error(`wiener-linien-austria-retro-card: config must be an object`);if(e.entity!==void 0&&typeof e.entity!=`string`)throw Error(`wiener-linien-austria-retro-card: 'entity' must be a string`);if(typeof e.entity==`string`&&e.entity&&!e.entity.startsWith(`sensor.`))throw Error(`wiener-linien-austria-retro-card: 'entity' must be in the sensor domain (got "${e.entity}")`);this._config=zt(e),this._clearRaceTimers(),this._clearTickerTimer(),this._clearViaTimer(),this._raceState=`idle`,this._countdownDigit=null,this._countdownStartAt=null,this._raceEndAt=null,this._freezeEndAt=null,this._victoryEndAt=null,this._raceWinner=null,this._tickerActive=!1,this._fallbackWarned=!1,this._cachedEid=null}getCardSize(){return 2}getGridOptions(){return{columns:12,rows:`auto`,min_columns:4,min_rows:2}}static getConfigElement(){return document.createElement(`wiener-linien-austria-retro-card-editor`)}static getStubConfig(e){let t=tn(e)[0]||``,n=`H`,r=e?.states?.[t]?.attributes?.departures;if(Array.isArray(r)){let e=r.some(e=>e.direction===`H`),t=r.some(e=>e.direction===`R`);!e&&t&&(n=`R`)}return{entity:t,direction:n,size:`small`}}connectedCallback(){super.connectedCallback(),rn(),typeof document<`u`&&document.fonts?.ready&&document.fonts.ready.then(()=>{document.fonts.check(`700 16px "WL Mono"`)||console.warn(`[wiener-linien-austria-retro-card] "WL Mono" 700 not loaded — falling back to Courier New (less authentic). Check /wiener-linien-austria/fonts/ is served by the integration.`)}).catch(e=>{console.warn(`[wiener-linien-austria-retro-card] document.fonts.ready rejected`,e)}),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion()),this._raceState!==`idle`&&(this._config?.wheelchair_race?this._armStateTransitions():(this._raceState=`idle`,this._clearRaceTimers())),this._config?.message_ticker&&this._config?.message_text&&this._scheduleTicker(Zn)}disconnectedCallback(){super.disconnectedCallback(),this._clearRaceTimers(),this._clearTickerTimer(),this._clearViaTimer()}shouldUpdate(e){if(!this._config)return!1;if(e.has(`_config`)||e.has(`_versionMismatch`)||e.has(`_raceState`)||e.has(`_countdownDigit`)||e.has(`_raceWinner`)||e.has(`_tickerActive`)||e.has(`_viaPhase`))return!0;let t=e.get(`hass`);if(!t||!this.hass)return!0;let n=this._resolveEntity();return n?t.states[n]!==this.hass.states[n]:!1}updated(e){super.updated(e),this._anyViaInRows?this._armViaTimer():this._viaTimer!==null&&this._clearViaTimer()}willUpdate(e){if(!e.has(`_config`))return;let t=e.get(`_config`),n=t?.wheelchair_race===!0,r=this._config?.wheelchair_race===!0;r&&!n?(this._clearRaceTimers(),this._startRace()):!r&&n&&(this._clearRaceTimers(),this._raceState=`idle`,this._countdownStartAt=null,this._countdownDigit=null,this._raceEndAt=null,this._freezeEndAt=null,this._victoryEndAt=null,this._raceWinner=null);let i=t?.message_ticker===!0&&!!t?.message_text,a=this._config?.message_ticker===!0&&!!this._config?.message_text,o=t?.message_text!==this._config?.message_text;a&&(!i||o)?(this._tickerActive=!1,this._scheduleTicker(1500)):!a&&i&&(this._clearTickerTimer(),this._tickerActive=!1)}_t(e,t){return at(`retro.${e}`,{hassLanguage:this.hass?.language},t)}async _checkCardVersion(){try{this._versionMismatch=await ot(this.hass,`wiener_linien_austria/retro_card_version`,`2.0.0`)}catch(e){console.warn(`[wiener-linien-austria-retro-card] version probe failed`,e)}}_resolveEntity(){let e=this._config?.entity;if(e&&this.hass?.states?.[e])return this._cachedEid=e,e;if(this._cachedEid&&this.hass?.states?.[this._cachedEid])return this._cachedEid;let t=tn(this.hass)[0]??null;return t&&e&&!this._fallbackWarned&&(this._fallbackWarned=!0,console.warn(`[wiener-linien-austria-retro-card] configured entity "${e}" not in hass.states; falling back to "${t}"`)),this._cachedEid=t,t}_clearRaceTimers(){for(let e of this._raceTimers)clearTimeout(e);this._raceTimers.clear()}_scheduleRaceTimer(e,t){let n=setTimeout(()=>{this._raceTimers.delete(n),e()},t);this._raceTimers.add(n)}_scheduleRace(e){this._scheduleRaceTimer(()=>this._startRace(),e)}_clearTickerTimer(){this._tickerTimer!==null&&(clearTimeout(this._tickerTimer),this._tickerTimer=null)}_scheduleTicker(e){this._clearTickerTimer(),this._tickerTimer=setTimeout(()=>{this._tickerTimer=null,this._runTicker()},e)}_runTicker(){if(this._config?.message_ticker&&this._config?.message_text){if(this._raceState!==`idle`){this._scheduleTicker(2e4);return}if(typeof window<`u`&&window.matchMedia?.(`(prefers-reduced-motion: reduce)`).matches){this._scheduleTicker(Zn);return}this._tickerActive=!0}}_tickerDurationSeconds(e){return Math.min(40,Math.max(8,5+e.length*.18))}_armViaTimer(){this._viaTimer===null&&(this._viaTimer=setInterval(()=>{this._viaPhase=this._viaPhase===`towards`?`via`:`towards`},4e3))}_clearViaTimer(){this._viaTimer!==null&&(clearInterval(this._viaTimer),this._viaTimer=null),this._viaPhase=`towards`}_startRace(){if(!this._config?.wheelchair_race)return;if(typeof window<`u`&&window.matchMedia?.(`(prefers-reduced-motion: reduce)`).matches){this._scheduleRace(this._nextRaceDelay());return}if(this._currentBarrierFreeCount()<2){this._scheduleRace(this._nextRaceDelay());return}if(this._tickerActive){this._scheduleRace(this._nextRaceDelay());return}let{winnerCrossT:e}=this._randomizeRaceParams(),t=Date.now();this._raceState=`countdown`,this._countdownStartAt=t,this._countdownDigit=3,this._raceEndAt=t+Xn+e+150,this._freezeEndAt=this._raceEndAt+1500,this._victoryEndAt=this._freezeEndAt+4e3,this._scheduleCountdownTick()}_scheduleCountdownTick(){if(this._raceState!==`countdown`||this._countdownStartAt===null)return;let e=Date.now(),t=e-this._countdownStartAt;if(t>=Xn){this._beginRacing();return}let n=Math.max(1,Math.min(3,3-Math.floor(t/800)));this._countdownDigit!==n&&(this._countdownDigit=n);let r=this._countdownStartAt+(Math.floor(t/800)+1)*800,i=Math.max(50,r-e);this._scheduleRaceTimer(()=>this._scheduleCountdownTick(),i)}_beginRacing(){this._raceState=`racing`,this._countdownDigit=null,this._countdownStartAt=null,this._armStateTransitions()}_measureRaceStartPositions(){let e=this.shadowRoot?.querySelector(`.retro`);if(!e)return null;let t=e.getBoundingClientRect();if(t.width<=0)return null;let n=this.shadowRoot?.querySelectorAll(`.retro-row .retro-wheelchair`);if(!n||n.length<2)return null;let r=n[0],i=n[1];if(!r||!i)return null;let a=r.getBoundingClientRect(),o=i.getBoundingClientRect(),s=a.left-t.left,c=o.left-t.left,l=100-(this._config?.size===`small`?10:14)/t.width*100-a.width/t.width*100;return{a:s/t.width*100,b:c/t.width*100,finishCqw:l}}_randomizeRaceParams(){let e=this._measureRaceStartPositions(),t=vn({a:e?.a??0,b:e?.b??0,finishCqw:e?.finishCqw??96});this._raceWinner=t.winner;for(let[e,n]of Object.entries(t.cssVars))this.style.setProperty(e,n);return{winnerCrossT:t.winnerCrossT}}_armStateTransitions(){this._clearRaceTimers();let e=Date.now();switch(this._raceState){case`idle`:return;case`countdown`:this._countdownStartAt!==null&&this._scheduleCountdownTick();return;case`racing`:this._raceEndAt!==null&&this._scheduleRaceTimer(()=>{this._raceState=`freeze`,this._raceEndAt=null,this._armStateTransitions()},Math.max(0,this._raceEndAt-e));return;case`freeze`:this._freezeEndAt!==null&&this._scheduleRaceTimer(()=>{this._raceState=`victory`,this._freezeEndAt=null,this._armStateTransitions()},Math.max(0,this._freezeEndAt-e));return;case`victory`:this._victoryEndAt!==null&&this._scheduleRaceTimer(()=>{this._raceState=`idle`,this._victoryEndAt=null,this._config?.wheelchair_race&&this._scheduleRace(this._nextRaceDelay())},Math.max(0,this._victoryEndAt-e));return;default:{let e=this._raceState;throw Error(`unhandled race state: ${String(e)}`)}}}_nextRaceDelay(){return 6e4+Math.random()*12e4}_currentBarrierFreeCount(){if(!this._config)return 0;let e=this._resolveEntity();if(!e||!this.hass)return 0;let t=this.hass.states[e]?.attributes??{};return Xt(Array.isArray(t.departures)?t.departures:[],{direction:this._config.direction,lines:this._config.line?[this._config.line]:void 0,walk_times:this._config.walk_times,accessibility_only:this._config.accessibility_only}).slice(0,2).filter(e=>e.barrier_free).length}render(){if(!this._config)return L;let e=this._config,t=this._resolveEntity(),n=t?this.hass?.states?.[t]?.attributes??{}:{},{rows:r,matching:i,departures:a,platform:o,gleisLeft:s,platformLabelKey:c,stopName:l}=en(e,n),u=this._t(c),d=e.show_station_name&&l?this._renderStationName(l,i,a,e.station_bg,n.line_colors??{},e.line):L,f=e.show_header?ln({left:e.header_left,right:e.header_right,serverTime:n.server_time,t:e=>this._t(e),lang:this.hass?.language}):L,p=e.wheelchair_race&&this._raceState===`countdown`,m=e.wheelchair_race&&this._raceState===`racing`,h=e.wheelchair_race&&this._raceState===`freeze`,g=e.wheelchair_race&&this._raceState===`victory`,_=e.wheelchair_race&&this._raceState===`idle`||this._tickerActive,v=this._raceWinner===`A`?1:this._raceWinner===`B`?2:null;this._anyViaInRows=r.some(e=>!!e.via);let y={retro:!0,"retro--gleis-left":!!o&&s,"retro--gleis-right":!!o&&!s,"retro--no-gleis":!o,[`retro--size-${e.size}`]:e.size!==`regular`,[`retro--style-${e.style}`]:e.style!==`classic`,"retro--flicker":e.flicker,"retro--race-countdown":p,"retro--race-active":m,"retro--race-freeze":h,"retro--race-victory":g,"retro--clickable":_,"retro--line-pill":e.show_line_pill,"retro--line-stripe":e.line_stripe,"retro--housing":e.housing},b=_?{role:`button`,tabindex:`0`,"aria-label":this._tickerActive?this._t(`aria_dismiss_message`):this._t(`aria_start_race`)}:{};return F`
      <ha-card style="padding:0;overflow:hidden;">
        <div
          class=${W(y)}
          role=${b.role??L}
          tabindex=${b.tabindex??L}
          aria-label=${b[`aria-label`]??L}
          @click=${this._handleCardClick}
          @keydown=${_?this._handleCardKeydown:L}>
          ${lt(this._versionMismatch,e=>this._t(e),`retro-banner`)}
          ${f}
          ${d}
          <div class="retro-led">
            ${this._renderMain(t,r,a,o,u,n.server_time,n.line_colors??{},typeof n.stale_departures==`number`?n.stale_departures:0)}
            ${this._tickerActive&&e.message_text?F`<div class="retro-ticker" role="status" aria-live="polite">
                  <div
                    class="retro-ticker-text"
                    style=${`animation-duration:${this._tickerDurationSeconds(e.message_text)}s`}
                    @animationend=${this._onTickerDone}
                  >
                    ${e.message_text}
                  </div>
                </div>`:L}
            ${p&&this._countdownDigit!==null?F`<div class="retro-countdown" role="status" aria-live="polite">
                  ${ze(this._countdownDigit,F`<span class="retro-countdown-digit" aria-hidden="true">${this._countdownDigit}</span>`)}
                  <span class="retro-victory-sr">
                    ${this._t(`race_starting_in`,{n:this._countdownDigit})}
                  </span>
                </div>`:L}
            ${p||m||h?F`<div class="retro-finish-line" aria-hidden="true"></div>`:L}
            ${g?F`<div class="retro-victory" role="status" aria-live="polite">
                  <div class="retro-victory-flag" aria-hidden="true"></div>
                  ${v===null?L:F`<div class="retro-victory-winner" aria-hidden="true">
                        <ha-icon class="retro-winner-trophy" icon="mdi:trophy"></ha-icon>
                        <span class="retro-winner-num">${v}</span>
                      </div>`}
                  <span class="retro-victory-sr">
                    ${v===null?this._t(`race_finished`):this._t(`race_winner_announce`,{n:v})}
                  </span>
                </div>`:L}
          </div>
        </div>
      </ha-card>
    `}_renderMain(e,t,n,r,i,a,o,s){if(!e)return F`<div class="retro-empty" role="status" aria-live="polite">${this._t(`no_entity`)}</div>`;if(t.length===0){let e=this._config.direction,t=this._config.line,r=n.filter(t=>t.direction===e),i=`no_data`;return n.length===0&&s>0?i=`stale_feed`:n.length===0&&a?i=`betriebsschluss`:n.length>0&&r.length===0?i=`no_data_wrong_direction`:t&&r.length>0&&(i=`no_data_wrong_line`),F`<div class="retro-empty" role="status" aria-live="polite">${this._t(i)}</div>`}return F`
      <ul class="retro-rows" role="list" aria-label=${this._t(`departures_list`)}>
        ${t.map((e,t)=>this._renderRow(e,t,o))}
      </ul>
      ${r?this._renderGleis(r,i):L}
    `}_renderRow(e,t,n){let r=Number.isFinite(e.countdown)?e.countdown:null,i=r!==null&&r<=0,a=e.line||`?`,o=e.towards||``,s=typeof e.via==`string`&&e.via.trim()?e.via.trim():null,c=r===null?this._t(`no_data`):i?this._t(`at_platform`):this._t(`countdown_minutes`,{n:String(r)}),l=e.barrier_free?this._t(`barrier_free_title`):``,u=[a,o,s?`${this._t(`via_prefix`)} ${s}`:``,c,l].filter(Boolean).join(` — `),d=Bt(a,{},n),f=d.background!==`var(--primary-color)`,p=f?d.background:`var(--led-amber)`,m=d.color??(f?`#fff`:`var(--led-bg)`),h=G({"--row-i":String(t),"--retro-line-color":p,"--retro-line-fg":m}),g=!!s;return F`
      <li class="retro-row" style=${h} aria-label=${u}>
        <div class="retro-line" aria-hidden="true">
          <span class="retro-line__label">${a}</span>
        </div>
        <div class="retro-dest" aria-hidden="true">
          <span class="retro-dest-stack">
            <span class="retro-dest-text retro-dest-text--layout">${Be(o)}</span>
            ${g?F`
                  <span
                    class=${W({"retro-dest-text":!0,"retro-dest-text--absolute":!0,"retro-dest-text--visible":this._viaPhase===`towards`})}
                  >${Be(o)}</span>
                  <span
                    class=${W({"retro-dest-text":!0,"retro-dest-text--absolute":!0,"retro-dest-text--via":!0,"retro-dest-text--visible":this._viaPhase===`via`})}
                  >${this._t(`via_prefix`)} ${Be(s)}</span>
                `:L}
          </span>
          ${e.barrier_free?F`<ha-icon
                class="retro-wheelchair"
                icon="mdi:wheelchair-accessibility"
                title=${this._t(`barrier_free_title`)}
              ></ha-icon>`:L}
        </div>
        <div class="retro-cd" aria-hidden="true">
          ${r===null?`--`:i?F`<span class="retro-stars"><span>*</span><span>*</span></span>`:this._config?.show_unit?F`<span class="retro-cd-num">${r}</span><span class="retro-cd-unit">${this._t(`unit_min`)}</span>`:String(r)}
        </div>
      </li>
    `}_renderGleis(e,t){return F`
      <div class="retro-gleis">
        <div class="retro-gleis-label">${t}</div>
        <div class="retro-gleis-number">${e}</div>
      </div>
    `}_renderStationName(e,t,n,r,i,a){let o,s;if(r===`white`)o=`#fff`,s=`#000`;else if(r===`black`)o=`#000`,s=`#fff`;else{let e=t.length?t:n,r=a||e[0]?.line;if(r){let e=Bt(r,{},i);o=e.background,s=e.color??`#fff`,o===`var(--primary-color)`&&(o=`#fff`,s=`#000`)}else o=`#fff`,s=`#000`}return F`
      <div class="retro-station" style=${G({background:o,color:s})}>
        <div class="retro-station-name">${Be(e)}</div>
      </div>
    `}static{this.styles=c`:host {
display: block;
isolation: isolate;
}
.retro {
--led-amber: #FFC700;
--led-bg: #000;
--led-substrate: #1a0d2a;
--led-glow-rgb: 255 199 0;
--led-dot-size: 0.5px;
--led-dot-edge: 1px;
--led-dot-pitch: 4px;
--retro-pad-y: 14px;
--retro-pad-r: 22px;
--retro-pad-l: 22px;
container-type: inline-size;
position: relative;
display: flex;
flex-direction: column;
font-family: "WL Mono", "Courier New", Courier, monospace;
font-weight: 700;
letter-spacing: 0.08em;
overflow: hidden;
min-height: 110px;
}
.retro-led {
flex: 1;
position: relative;
display: flex;
align-items: stretch;
background: var(--led-bg);
background-image: radial-gradient(
circle,
var(--led-substrate) var(--led-dot-size),
transparent var(--led-dot-edge)
);
background-size: var(--led-dot-pitch) var(--led-dot-pitch);
padding: var(--retro-pad-y) var(--retro-pad-r) var(--retro-pad-y) var(--retro-pad-l);
}
.retro--style-pixel .retro-led::after {
content: '';
position: absolute;
inset: 0;
background-image: radial-gradient(
circle,
transparent var(--led-dot-size),
var(--led-bg) var(--led-dot-edge)
);
background-size: var(--led-dot-pitch) var(--led-dot-pitch);
pointer-events: none;
z-index: 30;
}
.retro--clickable {
cursor: pointer;
}
.retro--style-warm,
.retro--style-pixel {
--led-amber: #FFB000;
--led-bg: #050302;
--led-substrate: #2a1805;
--led-glow-rgb: 255 176 0;
--led-dot-size: 0.9px;
--led-dot-edge: 1.4px;
--led-dot-pitch: 3px;
}
.retro--gleis-left .retro-gleis { order: -1; }
.retro--gleis-right { --retro-pad-r: 14px; }
.retro--gleis-left { --retro-pad-l: 14px; }
.retro-rows {
flex: 1;
display: flex;
flex-direction: column;
justify-content: center;
gap: 8px;
color: var(--led-amber);
text-shadow: 0 0 6px rgb(var(--led-glow-rgb) / 0.7);
font-size: 1.9em;
line-height: 1;
list-style: none;
margin: 0;
padding: 0;
}
.retro-row {
display: grid;
grid-template-columns: 2.5em 1fr auto;
align-items: baseline;
gap: 12px;
white-space: nowrap;
position: relative;
}
.retro-line {
font-weight: 400;
text-align: left;
transition: opacity 0.15s ease-out;
}
.retro--line-pill .retro-line {
display: inline-flex;
align-items: baseline;
justify-content: center;
box-sizing: border-box;
font-weight: 700;
text-align: center;
min-width: 2em;
padding: 0.08em 0.4em;
border-radius: 0.18em;
background: var(--retro-line-color, transparent);
color: var(--retro-line-fg, var(--led-amber));
text-shadow: none;
box-shadow: 0 0 6px var(--retro-line-color, rgb(var(--led-glow-rgb) / 0.4));
}
.retro--line-pill .retro-line__label {
display: inline-block;
}
.retro-dest {
display: flex;
align-items: center;
gap: 0.35em;
text-transform: uppercase;
min-width: 0;
transition: opacity 0.15s ease-out;
}
.retro-dest-stack {
position: relative;
display: inline-block;
overflow: hidden;
flex: 0 1 auto;
min-width: 0;
max-width: 100%;
}
.retro-dest-text {
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
min-width: 0;
max-width: 100%;
display: block;
}
.retro-dest-text--layout {
visibility: visible;
}
.retro-dest-stack:has(.retro-dest-text--absolute) .retro-dest-text--layout {
visibility: hidden;
}
.retro-dest-text--absolute {
position: absolute;
inset: 0;
opacity: 0;
transition: opacity 0.4s ease-in-out;
will-change: opacity;
}
.retro-dest-text--visible {
opacity: 1;
}
.retro-wheelchair {
flex: 0 0 auto;
display: inline-flex;
align-items: center;
justify-content: center;
--mdc-icon-size: 0.9em;
width: 0.9em;
height: 0.9em;
color: inherit;
filter: drop-shadow(0 0 6px rgb(var(--led-glow-rgb) / 0.7));
transform: translateY(0.12em);
}
.retro-cd {
font-variant-numeric: tabular-nums;
text-align: right;
min-width: 2.5em;
transition: opacity 0.4s ease-out;
display: inline-flex;
align-items: baseline;
justify-content: flex-end;
gap: 0.25em;
}
.retro-cd-num {
display: inline-block;
}
.retro-cd-unit {
display: inline-block;
font-size: 0.5em;
text-transform: uppercase;
letter-spacing: 0.12em;
opacity: 0.85;
transform: translateY(-0.05em);
}
@container (inline-size < 360px) {
.retro-cd-unit { display: none; }
}
.retro-stars {
display: inline-flex;
gap: 0.08em;
justify-content: flex-end;
}
.retro-stars > span {
animation: retroStarBlink 1s infinite;
}
.retro-stars > span:nth-child(2) {
animation-delay: 0.5s;
}
@keyframes retroStarBlink {
0%, 49.99% { opacity: 1; }
50%, 100%  { opacity: 0; }
}
@keyframes retroLineFlicker {
0%, 6.9%   { opacity: 1; }
7.1%       { opacity: 0.38; }
7.5%       { opacity: 1; }
22.9%      { opacity: 1; }
23.1%      { opacity: 0.08; }
23.35%     { opacity: 1; }
23.7%      { opacity: 0.55; }
24%        { opacity: 1; }
51.9%      { opacity: 1; }
52.15%     { opacity: 0.45; }
52.4%      { opacity: 1; }
75.9%      { opacity: 1; }
76.1%      { opacity: 0.15; }
76.35%     { opacity: 1; }
77%        { opacity: 0.6; }
77.3%      { opacity: 1; }
100%       { opacity: 1; }
}
@media (prefers-reduced-motion: no-preference) {
.retro--flicker .retro-line {
animation: retroLineFlicker 7.3s infinite;
will-change: opacity;
}
.retro--flicker .retro-row:nth-child(2) .retro-line {
animation-duration: 8.1s;
animation-delay: -2.4s;
}
}
@keyframes retroWheelExit {
0%   { transform: translate(0, 0.18em); animation-timing-function: ease-out; }
25%  { transform: translate(var(--race-x-25, 25cqw), 0.18em); animation-timing-function: cubic-bezier(0.4, 0.2, 0.6, 0.8); }
50%  { transform: translate(var(--race-x-50, 50cqw), 0.18em); animation-timing-function: cubic-bezier(0.4, 0.2, 0.6, 0.8); }
75%  { transform: translate(var(--race-x-75, 75cqw), 0.18em); animation-timing-function: cubic-bezier(0.4, 0.2, 0.6, 0.8); }
100% { transform: translate(var(--race-end, 110cqw), 0.18em); }
}
@media (prefers-reduced-motion: no-preference) {
.retro--race-countdown .retro-dest,
.retro--race-active .retro-dest,
.retro--race-freeze .retro-dest {
overflow: visible;
}
.retro--race-countdown .retro-cd,
.retro--race-active .retro-cd,
.retro--race-freeze .retro-cd {
opacity: 0;
}
.retro--race-countdown.retro--gleis-right .retro-gleis,
.retro--race-active.retro--gleis-right .retro-gleis,
.retro--race-freeze.retro--gleis-right .retro-gleis {
opacity: 0;
}
.retro--race-active .retro-row:nth-child(1) .retro-wheelchair,
.retro--race-freeze .retro-row:nth-child(1) .retro-wheelchair {
--race-end: var(--race-a-end, 110cqw);
--race-x-25: var(--race-a-x-25, 25cqw);
--race-x-50: var(--race-a-x-50, 50cqw);
--race-x-75: var(--race-a-x-75, 75cqw);
animation: retroWheelExit var(--race-a-duration, 3.3s) linear forwards;
}
.retro--race-active .retro-row:nth-child(2) .retro-wheelchair,
.retro--race-freeze .retro-row:nth-child(2) .retro-wheelchair {
--race-end: var(--race-b-end, 110cqw);
--race-x-25: var(--race-b-x-25, 25cqw);
--race-x-50: var(--race-b-x-50, 50cqw);
--race-x-75: var(--race-b-x-75, 75cqw);
animation: retroWheelExit var(--race-b-duration, 3.3s) linear forwards;
}
.retro--race-freeze .retro-wheelchair {
animation-play-state: paused;
}
.retro--race-active .retro-wheelchair,
.retro--race-freeze .retro-wheelchair {
position: relative;
z-index: 4;
}
.retro--race-victory .retro-wheelchair {
opacity: 0;
}
}
.retro--race-victory .retro-line,
.retro--race-victory .retro-dest,
.retro--race-victory .retro-cd,
.retro--race-victory .retro-gleis {
opacity: 0;
}
.retro--race-victory.retro--flicker .retro-line {
animation: none;
}
.retro-ticker {
position: absolute;
inset: 0;
z-index: 16;
overflow: hidden;
display: flex;
align-items: center;
pointer-events: none;
background: var(--led-bg);
background-image: radial-gradient(
circle,
var(--led-substrate) var(--led-dot-size),
transparent var(--led-dot-edge)
);
background-size: var(--led-dot-pitch) var(--led-dot-pitch);
border-radius: inherit;
container-type: inline-size;
}
.retro-ticker-text {
flex: none;
white-space: nowrap;
font-size: 1.9em;
line-height: 1;
color: var(--led-amber);
text-shadow: 0 0 6px rgb(var(--led-glow-rgb) / 0.7);
text-transform: uppercase;
will-change: transform;
animation-name: retroTickerScroll;
animation-timing-function: linear;
animation-iteration-count: 1;
animation-fill-mode: both;
}
@keyframes retroTickerScroll {
from { transform: translateX(100cqw); }
to   { transform: translateX(-100%); }
}
.retro-finish-line {
position: absolute;
top: 0;
right: 0;
bottom: 0;
width: 14px;
z-index: 3;
pointer-events: none;
background-image: conic-gradient(
transparent 0deg 90deg,
var(--led-amber) 90deg 180deg,
transparent 180deg 270deg,
var(--led-amber) 270deg 360deg
);
background-size: 14px 14px;
filter: drop-shadow(0 0 4px rgb(var(--led-glow-rgb) / 0.7));
animation: retroFinishLineAppear 0.3s ease-out both;
}
@keyframes retroFinishLineAppear {
0%   { opacity: 0; transform: scaleX(0.2); transform-origin: right; }
100% { opacity: 1; transform: scaleX(1); }
}
.retro--size-small .retro-finish-line {
width: 10px;
background-size: 10px 10px;
}
.retro-victory {
position: absolute;
inset: 0;
z-index: 20;
display: flex;
align-items: center;
justify-content: center;
pointer-events: none;
overflow: hidden;
border-radius: inherit;
opacity: 1;
isolation: isolate;
container-type: size;
animation: retroVictoryAppear 0.22s ease-out both;
}
.retro-victory-sr {
position: absolute;
width: 1px;
height: 1px;
padding: 0;
margin: -1px;
overflow: hidden;
clip: rect(0, 0, 0, 0);
white-space: nowrap;
border: 0;
}
.retro-victory-flag {
position: absolute;
inset: 0;
background-image: conic-gradient(
transparent 0deg 90deg,
var(--led-amber) 90deg 180deg,
transparent 180deg 270deg,
var(--led-amber) 270deg 360deg
);
background-size: 50cqh 50cqh;
filter: drop-shadow(0 0 6px rgb(var(--led-glow-rgb) / 0.7));
animation: retroVictoryFlag 0.4s linear infinite;
}
@keyframes retroVictoryAppear {
0%   { opacity: 0; }
100% { opacity: 1; }
}
@keyframes retroVictoryFlag {
0%   { background-position: 0 0; }
100% { background-position: 100cqh 0; }
}
.retro-countdown {
position: absolute;
inset: 0;
z-index: 18;
display: flex;
align-items: center;
justify-content: center;
pointer-events: none;
background: rgba(0, 0, 0, 0.6);
border-radius: inherit;
overflow: hidden;
isolation: isolate;
container-type: size;
animation: retroCountdownAppear 0.18s ease-out both;
}
@keyframes retroCountdownAppear {
0%   { opacity: 0; }
100% { opacity: 1; }
}
.retro-countdown-digit {
display: block;
font-family: ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace;
font-weight: 900;
font-size: 60cqh;
line-height: 1;
color: var(--led-amber);
letter-spacing: -0.04em;
text-shadow:
0 0 10px rgb(var(--led-glow-rgb) / 0.9),
0 0 24px rgb(var(--led-glow-rgb) / 0.7),
0 0 40px rgb(var(--led-glow-rgb) / 0.4);
animation: retroCountdownPunch 0.8s ease-out both;
will-change: transform, opacity;
}
@keyframes retroCountdownPunch {
0%   { opacity: 0; transform: scale(0.4); }
18%  { opacity: 1; transform: scale(1.18); }
30%  {              transform: scale(1); }
72%  { opacity: 1; transform: scale(1); }
100% { opacity: 0; transform: scale(0.85); }
}
.retro-victory-winner {
position: absolute;
top: 50%;
left: 50%;
z-index: 22;
width: 45cqmin;
height: 45cqmin;
min-width: 90px;
min-height: 90px;
max-width: 190px;
max-height: 190px;
border-radius: 50%;
background-color: var(--led-bg);
background-image: radial-gradient(
circle,
var(--led-substrate) var(--led-dot-size),
transparent var(--led-dot-edge)
);
background-size: var(--led-dot-pitch) var(--led-dot-pitch);
display: flex;
align-items: center;
justify-content: center;
color: var(--led-amber);
transform: translate(-50%, -50%) scale(0.2);
opacity: 0;
animation: retroWinnerBadgeAppear 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.18s forwards;
}
@keyframes retroWinnerBadgeAppear {
0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
.retro-winner-trophy {
--mdc-icon-size: 57cqmin;
color: var(--led-amber);
filter: drop-shadow(0 0 4px rgb(var(--led-glow-rgb) / 0.85))
drop-shadow(0 0 10px rgb(var(--led-glow-rgb) / 0.45));
}
.retro-winner-num {
position: absolute;
top: 44%;
left: 0;
right: 0;
transform: translateY(-50%);
text-align: center;
font-family: "Arial Black", "Helvetica Neue", Helvetica, Arial, sans-serif;
font-weight: 900;
font-size: 20cqmin;
line-height: 1;
color: var(--led-substrate);
letter-spacing: -0.04em;
pointer-events: none;
}
.retro--size-small .retro-winner-trophy {
--mdc-icon-size: 51cqmin;
}
.retro--size-small .retro-winner-num {
font-size: 17cqmin;
top: 37%;
}
.retro--style-pixel .retro-victory-winner {
background-image: none;
}
.retro--style-pixel .retro-gleis {
margin-left: 13px;
}
.retro--style-pixel.retro--gleis-left .retro-gleis {
margin-right: 13px;
}
.retro--style-pixel.retro--size-small .retro-gleis {
margin-left: 9px;
}
.retro--style-pixel.retro--size-small.retro--gleis-left .retro-gleis {
margin-right: 9px;
}
.retro-gleis {
flex: 0 0 auto;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 0 14px 0 18px;
margin-left: 12px;
color: var(--led-amber);
text-shadow: 0 0 6px rgb(var(--led-glow-rgb) / 0.7);
transition: opacity 0.4s ease-out;
position: relative;
}
.retro-gleis::before {
content: '';
position: absolute;
top: 8%;
bottom: 8%;
left: 0;
width: 2px;
background-image: radial-gradient(
circle,
rgb(var(--led-glow-rgb) / 0.55) var(--led-dot-size),
transparent var(--led-dot-edge)
);
background-size: var(--led-dot-pitch) var(--led-dot-pitch);
pointer-events: none;
}
.retro--gleis-left .retro-gleis {
padding: 0 18px 0 14px;
margin-left: 0;
margin-right: 12px;
}
.retro--gleis-left .retro-gleis::before {
left: auto;
right: 0;
}
.retro-gleis-label {
font-size: 0.9em;
letter-spacing: 2px;
margin-bottom: 2px;
opacity: 0.9;
}
.retro-gleis-number {
font-size: 3em;
line-height: 1;
font-weight: 400;
}
.retro--size-medium {
--retro-pad-y: 11px;
--retro-pad-r: 18px;
--retro-pad-l: 18px;
min-height: 92px;
}
.retro--size-medium.retro--gleis-right { --retro-pad-r: 10px; }
.retro--size-medium.retro--gleis-left { --retro-pad-l: 10px; }
.retro--size-medium .retro-rows { font-size: 1.55em; gap: 6px; }
.retro--size-medium .retro-gleis { padding: 0 10px 0 14px; min-width: 48px; }
.retro--size-medium.retro--gleis-left .retro-gleis {
padding: 0 14px 0 10px;
}
.retro--size-medium .retro-gleis-number { font-size: 2.3em; }
.retro--size-medium .retro-gleis-label {
font-size: 0.8em;
letter-spacing: 1.5px;
}
.retro--size-small {
--retro-pad-y: 8px;
--retro-pad-r: 14px;
--retro-pad-l: 14px;
min-height: 72px;
}
.retro--size-small.retro--gleis-right { --retro-pad-r: 6px; }
.retro--size-small.retro--gleis-left { --retro-pad-l: 6px; }
.retro--size-small .retro-rows { font-size: 1.25em; gap: 4px; }
.retro--size-small .retro-row {
grid-template-columns: 2em 1fr auto;
gap: 8px;
}
.retro--size-small .retro-gleis {
padding: 0 8px 0 10px;
min-width: 38px;
margin-left: 8px;
}
.retro--size-small.retro--gleis-left .retro-gleis {
padding: 0 10px 0 8px;
margin-left: 0;
margin-right: 8px;
}
.retro--size-small .retro-gleis-number { font-size: 1.75em; }
.retro--size-small .retro-gleis-label {
font-size: 0.68em;
letter-spacing: 1px;
margin-bottom: 0;
}
.retro-empty {
flex: 1;
text-align: center;
align-self: center;
color: var(--led-amber);
text-shadow: 0 0 6px rgb(var(--led-glow-rgb) / 0.7);
font-size: 1.4em;
padding: 20px 0;
letter-spacing: 2px;
}
.retro-station {
display: flex;
align-items: center;
justify-content: center;
text-align: center;
padding: 11px 16px;
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
Helvetica, Arial, sans-serif;
font-weight: 700;
letter-spacing: 0.01em;
line-height: 1.05;
font-size: 1.95em;
}
.retro-station-name {
text-shadow: none;
}
.retro--size-medium .retro-station {
padding: 9px 14px;
font-size: 1.65em;
}
.retro--size-small .retro-station {
padding: 7px 10px;
font-size: 1.35em;
}
.retro-station-header {
display: flex;
align-items: center;
justify-content: space-between;
background: #000;
color: #fff;
padding: var(--ha-space-2, 8px) var(--ha-space-3, 12px);
gap: var(--ha-space-2, 8px);
font-family: "WL Sans Condensed", "WL Sans", -apple-system,
BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
Arial, sans-serif;
font-weight: 700;
font-size: 1.1em;
letter-spacing: 0.02em;
}
.retro-station-header__side {
display: flex;
align-items: center;
gap: 5px;
min-width: 0;
flex: 1 1 0;
}
.retro-station-header__side--right {
justify-content: flex-end;
}
.retro-station-header__text {
min-width: 0;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
font-size: 1.2em;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
}
.retro-station-header__tile {
display: inline-flex;
align-items: center;
justify-content: center;
background: #fff;
color: #000;
flex-shrink: 0;
width: 1.4em;
height: 1.4em;
padding: 0.12em;
box-sizing: border-box;
}
.retro-station-header__tile--mdi {
padding: 0.06em;
}
.retro-station-header__icon {
width: 100%;
height: 100%;
display: block;
fill: currentColor;
}
.retro-station-header__icon--flip-x {
transform: scaleX(-1);
}
.retro-station-header__mdi {
--mdc-icon-size: 1.28em;
display: inline-flex;
align-items: center;
justify-content: center;
color: inherit;
}
.retro-station-header__mdi--flip-x {
transform: scaleX(-1);
}
.retro-station-header__monogram {
font-family: "WL Sans Condensed", "WL Sans", -apple-system,
BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
Arial, sans-serif;
font-weight: 700;
font-size: 0.9em;
line-height: 1;
}
.retro-station-header__chip {
display: inline-flex;
align-items: center;
justify-content: center;
background: #fff;
color: #000;
flex-shrink: 0;
height: 1.4em;
padding: 0 0.4em;
box-sizing: border-box;
font-family: "WL Sans Condensed", "WL Sans", -apple-system,
BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
Arial, sans-serif;
font-weight: 700;
line-height: 1;
letter-spacing: 0;
white-space: nowrap;
}
.retro--size-medium .retro-station-header {
font-size: 0.9em;
padding: 6px var(--ha-space-2, 8px);
}
.retro--size-small .retro-station-header {
font-size: 0.8em;
padding: 5px var(--ha-space-2, 8px);
}
@container (inline-size < 320px) {
.retro-station-header__text {
display: none;
}
}
.retro-banner {
background: #ffa000;
color: #000;
padding: 6px 10px;
margin-bottom: 10px;
display: flex;
align-items: center;
justify-content: space-between;
gap: 8px;
font-family: sans-serif;
border-radius: 4px;
letter-spacing: normal;
font-size: 0.75em;
}
.retro-banner button {
background: #000;
color: #ffa000;
border: none;
border-radius: 3px;
padding: 3px 10px;
font-weight: 600;
cursor: pointer;
font-family: sans-serif;
}
a:focus-visible,
button:focus-visible {
outline: 2px solid var(--led-amber, #ffa000);
outline-offset: 2px;
border-radius: 4px;
}
@keyframes retroRowReveal {
from {
opacity: 0;
transform: translateY(3px);
filter: brightness(0.4);
}
to {
opacity: 1;
transform: none;
filter: brightness(1);
}
}
.retro-row {
animation: retroRowReveal 380ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
animation-delay: calc(min(var(--row-i, 0), 6) * 80ms);
}
.retro-station-header__chip--clock {
gap: 0.25em;
}
.retro-station-header__chip-icon {
--mdc-icon-size: 1em;
display: inline-flex;
align-items: center;
color: inherit;
flex-shrink: 0;
}
.retro--line-stripe .retro-row {
padding-left: 10px;
}
.retro--line-stripe .retro-row::before {
content: '';
position: absolute;
top: 0;
bottom: 0;
left: 0;
width: 4px;
background: var(--retro-line-color, var(--led-amber));
filter: drop-shadow(0 0 4px var(--retro-line-color, rgb(var(--led-glow-rgb) / 0.45)));
pointer-events: none;
border-radius: 1px;
}
.retro--housing {
padding: 6px;
background: #111;
border-radius: 10px;
box-shadow:
inset 0 1px 0 rgba(255, 255, 255, 0.06),
0 2px 8px rgba(0, 0, 0, 0.5);
}
.retro--housing .retro-led {
border-radius: 6px;
}
.retro--housing .retro-led::before {
content: '';
position: absolute;
inset: 0;
background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 40%);
pointer-events: none;
z-index: 2;
border-radius: inherit;
}
.retro--housing .retro-station-header {
border-top-left-radius: 6px;
border-top-right-radius: 6px;
}
.retro--housing .retro-station:last-child,
.retro--housing .retro-station-header:last-child {
border-bottom-left-radius: 6px;
border-bottom-right-radius: 6px;
}
@media (prefers-reduced-motion: reduce) {
*,
*::before,
*::after {
animation-duration: 0.01ms !important;
animation-iteration-count: 1 !important;
transition-duration: 0.01ms !important;
scroll-behavior: auto !important;
}
}`}};Z([Me({attribute:!1})],$.prototype,`hass`,void 0),Z([H()],$.prototype,`_config`,void 0),Z([H()],$.prototype,`_versionMismatch`,void 0),Z([H()],$.prototype,`_raceState`,void 0),Z([H()],$.prototype,`_countdownDigit`,void 0),Z([H()],$.prototype,`_raceWinner`,void 0),Z([H()],$.prototype,`_tickerActive`,void 0),Z([H()],$.prototype,`_viaPhase`,void 0),$=Z([ke(`wiener-linien-austria-retro-card`)],$);export{$ as WienerLinienAustriaRetroCard};
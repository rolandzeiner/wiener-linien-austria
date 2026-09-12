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
switch(t){case Boolean:e=e?y:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},C=(e,t)=>!d(e,t),w={attribute:!0,type:String,converter:S,reflect:!1,useDefault:!1,hasChanged:C};Symbol.metadata??=Symbol(`metadata`),_.litPropertyMetadata??=new WeakMap;var T=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=w){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&f(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=p(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??w}static _$Ei(){if(this.hasOwnProperty(x(`elementProperties`)))return;let e=g(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(x(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(x(`properties`))){let e=this.properties,t=[...m(e),...h(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(u(e))}else e!==void 0&&t.push(u(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return l(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?S:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?S:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??C)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};T.elementStyles=[],T.shadowRootOptions={mode:`open`},T[x(`elementProperties`)]=new Map,T[x(`finalized`)]=new Map,b?.({ReactiveElement:T}),(_.reactiveElementVersions??=[]).push(`2.1.2`);
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const ee=globalThis,E=e=>e,D=ee.trustedTypes,te=D?D.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,ne=`$lit$`,O=`lit$${Math.random().toFixed(9).slice(2)}$`,re=`?`+O,ie=`<${re}>`,k=document,A=()=>k.createComment(``),j=e=>e===null||typeof e!=`object`&&typeof e!=`function`,ae=Array.isArray,oe=e=>ae(e)||typeof e?.[Symbol.iterator]==`function`,se=`[ 	
\f\r]`,M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ce=/-->/g,le=/>/g,N=RegExp(`>|${se}(?:([^\\s"'>=/]+)(${se}*=${se}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),ue=/'/g,de=/"/g,fe=/^(?:script|style|textarea|title)$/i,P=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),F=Symbol.for(`lit-noChange`),I=Symbol.for(`lit-nothing`),pe=new WeakMap,L=k.createTreeWalker(k,129);function me(e,t){if(!ae(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return te===void 0?t:te.createHTML(t)}const he=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=M;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===M?c[1]===`!--`?o=ce:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=N):(fe.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=N):o=le:o===N?c[0]===`>`?(o=i??M,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?N:c[3]===`"`?de:ue):o===de||o===ue?o=N:o===ce||o===le?o=M:(o=N,i=void 0);let d=o===N&&e[t+1].startsWith(`/>`)?` `:``;a+=o===M?n+ie:l>=0?(r.push(s),n.slice(0,l)+ne+n.slice(l)+O+d):n+O+(l===-2?t:d)}return[me(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]};var ge=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=he(t,n);if(this.el=e.createElement(l,r),L.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=L.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(ne)){let t=u[o++],n=i.getAttribute(e).split(O),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?be:r[1]===`?`?xe:r[1]===`@`?Se:ye}),i.removeAttribute(e)}else e.startsWith(O)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(fe.test(i.tagName)){let e=i.textContent.split(O),t=e.length-1;if(t>0){i.textContent=D?D.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],A()),L.nextNode(),c.push({type:2,index:++a});i.append(e[t],A())}}}else if(i.nodeType===8){if(i.data===re)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(O,e+1))!==-1;)c.push({type:7,index:a}),e+=O.length-1}}a++}}static createElement(e,t){let n=k.createElement(`template`);return n.innerHTML=e,n}};function R(e,t,n=e,r){if(t===F)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=j(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=R(e,i._$AS(e,t.values),i,r)),t}var _e=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??k).importNode(t,!0);L.currentNode=r;let i=L.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new ve(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Ce(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=L.nextNode(),a++)}return L.currentNode=k,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},ve=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=I,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=R(this,e,t),j(e)?e===I||e==null||e===``?(this._$AH!==I&&this._$AR(),this._$AH=I):e!==this._$AH&&e!==F&&this._(e):e._$litType$===void 0?e.nodeType===void 0?oe(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==I&&j(this._$AH)?this._$AA.nextSibling.data=e:this.T(k.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=ge.createElement(me(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new _e(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=pe.get(e.strings);return t===void 0&&pe.set(e.strings,t=new ge(e)),t}k(t){ae(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(A()),this.O(A()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=E(e).nextSibling;E(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},ye=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=I,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=I}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=R(this,e,t,0),a=!j(e)||e!==this._$AH&&e!==F,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=R(this,r[n+o],t,o),s===F&&(s=this._$AH[o]),a||=!j(s)||s!==this._$AH[o],s===I?e=I:e!==I&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===I?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},be=class extends ye{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===I?void 0:e}},xe=class extends ye{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==I)}},Se=class extends ye{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=R(this,e,t,0)??I)===F)return;let n=this._$AH,r=e===I&&n!==I||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==I&&(n===I||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ce=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){R(this,e)}};const we={M:ne,P:O,A:re,C:1,L:he,R:_e,D:oe,V:R,I:ve,H:ye,N:xe,U:Se,B:be,F:Ce},Te=ee.litHtmlPolyfillSupport;Te?.(ge,ve),(ee.litHtmlVersions??=[]).push(`3.3.2`);const Ee=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new ve(t.insertBefore(A(),e),e,void 0,n??{})}return i._$AI(e),i},De=globalThis
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
;var z=class extends T{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ee(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}};z._$litElement$=!0,z.finalized=!0,De.litElementHydrateSupport?.({LitElement:z});const Oe=De.litElementPolyfillSupport;Oe?.({LitElement:z}),(De.litElementVersions??=[]).push(`4.2.2`);
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
*/function B(e){return Me({...e,state:!0,attribute:!1})}
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const V={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Ne=e=>(...t)=>({_$litDirective$:e,values:t});var Pe=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};
/**
* @license
* Copyright 2018 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/const H=Ne(class extends Pe{constructor(e){if(super(e),e.type!==V.ATTRIBUTE||e.name!==`class`||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return` `+Object.keys(e).filter(t=>e[t]).join(` `)+` `}update(e,[t]){if(this.st===void 0){this.st=new Set,e.strings!==void 0&&(this.nt=new Set(e.strings.join(` `).split(/\s/).filter(e=>e!==``)));for(let e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}let n=e.element.classList;for(let e of this.st)e in t||(n.remove(e),this.st.delete(e));for(let e in t){let r=!!t[e];r===this.st.has(e)||this.nt?.has(e)||(r?(n.add(e),this.st.add(e)):(n.remove(e),this.st.delete(e)))}return F}}),U=Ne(class extends Pe{constructor(e){
/**
* @license
* Copyright 2018 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
if(super(e),e.type!==V.ATTRIBUTE||e.name!==`style`||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{let r=e[n];return r==null?t:t+`${n=n.includes(`-`)?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,`-$&`).toLowerCase()}:${r};`},``)}update(e,[t]){let{style:n}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let e of this.ft)t[e]??(this.ft.delete(e),e.includes(`-`)?n.removeProperty(e):n[e]=null);for(let e in t){let r=t[e];if(r!=null){this.ft.add(e);let t=typeof r==`string`&&r.endsWith(` !important`);e.includes(`-`)||t?n.setProperty(e,t?r.slice(0,-11):r,t?`important`:``):n[e]=r}}return F}});let Fe=null;var Ie=class{};Ie.render=function(e,t){Fe(e,t)},self.QrCreator=Ie,(function(e){function t(t,n,r,i){var a={},o=e(r,n);o.u(t),o.J(),i||=0;var s=o.h(),c=o.h()+2*i;return a.text=t,a.level=n,a.version=r,a.O=c,a.a=function(e,t){return e-=i,t-=i,0>e||e>=s||0>t||t>=s?!1:o.a(e,t)},a}function n(e,t,n,r,i,a,o,s,c,l){function u(t,n,r,i,o,s,c){t?(e.lineTo(n+s,r+c),e.arcTo(n,r,i,o,a)):e.lineTo(n,r)}o?e.moveTo(t+a,n):e.moveTo(t,n),u(s,r,n,r,i,-a,0),u(c,r,i,t,i,0,-a),u(l,t,i,t,n,a,0),u(o,t,n,r,n,0,a)}function r(e,t,n,r,i,a,o,s,c,l){function u(t,n,r,i){e.moveTo(t+r,n),e.lineTo(t,n),e.lineTo(t,n+i),e.arcTo(t,n,t+r,n,a)}o&&u(t,n,a,a),s&&u(r,n,-a,a),c&&u(r,i,-a,-a),l&&u(t,i,a,-a)}function i(e,t){var n=t.fill;if(typeof n==`string`)e.fillStyle=n;else{var r=n.type,i=n.colorStops;if(n=n.position.map(e=>Math.round(e*t.size)),r===`linear-gradient`)var a=e.createLinearGradient.apply(e,n);else if(r===`radial-gradient`)a=e.createRadialGradient.apply(e,n);else throw Error(`Unsupported fill`);i.forEach(([e,t])=>{a.addColorStop(e,t)}),e.fillStyle=a}}function a(e,a){a:{var o=a.text,s=a.v,c=a.N,l=a.K,u=a.P;for(c=Math.max(1,c||1),l=Math.min(40,l||40);c<=l;c+=1)try{var d=t(o,s,c,u);break a}catch{}d=void 0}if(!d)return null;for(o=e.getContext(`2d`),a.background&&(o.fillStyle=a.background,o.fillRect(a.left,a.top,a.size,a.size)),s=d.O,l=a.size/s,o.beginPath(),u=0;u<s;u+=1)for(c=0;c<s;c+=1){var f=o,p=a.left+c*l,m=a.top+u*l,h=u,g=c,_=d.a,v=p+l,y=m+l,b=h-1,x=h+1,S=g-1,C=g+1,w=Math.floor(Math.min(.5,Math.max(0,a.R))*l),T=_(h,g),ee=_(b,S),E=_(b,g);b=_(b,C);var D=_(h,C);C=_(x,C),g=_(x,g),x=_(x,S),h=_(h,S),p=Math.round(p),m=Math.round(m),v=Math.round(v),y=Math.round(y),T?n(f,p,m,v,y,w,!E&&!h,!E&&!D,!g&&!D,!g&&!h):r(f,p,m,v,y,w,E&&h&&ee,E&&D&&b,g&&D&&C,g&&h&&x)}return i(o,a),o.fill(),e}var o={minVersion:1,maxVersion:40,ecLevel:`L`,left:0,top:0,size:200,fill:`#000`,background:null,text:`no text`,radius:.5,quiet:0};Fe=function(e,t){var n={};Object.assign(n,o,e),n.N=n.minVersion,n.K=n.maxVersion,n.v=n.ecLevel,n.left=n.left,n.top=n.top,n.size=n.size,n.fill=n.fill,n.background=n.background,n.text=n.text,n.R=n.radius,n.P=n.quiet,t instanceof HTMLCanvasElement?((t.width!==n.size||t.height!==n.size)&&(t.width=n.size,t.height=n.size),t.getContext(`2d`).clearRect(0,0,t.width,t.height),a(t,n)):(e=document.createElement(`canvas`),e.width=n.size,e.height=n.size,n=a(e,n),t.appendChild(n))}})(function(){function e(e){var t=n.s(e);return{S:function(){return 4},b:function(){return t.length},write:function(e){for(var n=0;n<t.length;n+=1)e.put(t[n],8)}}}function t(){var e=[],t=0,n={B:function(){return e},c:function(t){return(e[Math.floor(t/8)]>>>7-t%8&1)==1},put:function(e,t){for(var r=0;r<t;r+=1)n.m((e>>>t-r-1&1)==1)},f:function(){return t},m:function(n){var r=Math.floor(t/8);e.length<=r&&e.push(0),n&&(e[r]|=128>>>t%8),t+=1}};return n}function n(n,o){function c(e,t){for(var n=-1;7>=n;n+=1)if(!(-1>=e+n||f<=e+n))for(var r=-1;7>=r;r+=1)-1>=t+r||f<=t+r||(d[e+n][t+r]=0<=n&&6>=n&&(r==0||r==6)||0<=r&&6>=r&&(n==0||n==6)||2<=n&&4>=n&&2<=r&&4>=r)}function l(e,i){for(var o=f=4*n+17,l=Array(o),h=0;h<o;h+=1){l[h]=Array(o);for(var g=0;g<o;g+=1)l[h][g]=null}for(d=l,c(0,0),c(f-7,0),c(0,f-7),o=a.G(n),l=0;l<o.length;l+=1)for(h=0;h<o.length;h+=1){g=o[l];var _=o[h];if(d[g][_]==null)for(var v=-2;2>=v;v+=1)for(var y=-2;2>=y;y+=1)d[g+v][_+y]=v==-2||v==2||y==-2||y==2||v==0&&y==0}for(o=8;o<f-8;o+=1)d[o][6]??(d[o][6]=o%2==0);for(o=8;o<f-8;o+=1)d[6][o]??(d[6][o]=o%2==0);for(o=a.w(u<<3|i),l=0;15>l;l+=1)h=!e&&(o>>l&1)==1,d[6>l?l:8>l?l+1:f-15+l][8]=h,d[8][8>l?f-l-1:9>l?15-l:14-l]=h;if(d[f-8][8]=!e,7<=n){for(o=a.A(n),l=0;18>l;l+=1)h=!e&&(o>>l&1)==1,d[Math.floor(l/3)][l%3+f-8-3]=h;for(l=0;18>l;l+=1)h=!e&&(o>>l&1)==1,d[l%3+f-8-3][Math.floor(l/3)]=h}if(p==null){for(e=s.I(n,u),o=t(),l=0;l<m.length;l+=1)h=m[l],o.put(4,4),o.put(h.b(),a.f(4,n)),h.write(o);for(l=h=0;l<e.length;l+=1)h+=e[l].j;if(o.f()>8*h)throw Error(`code length overflow. (`+o.f()+`>`+8*h+`)`);for(o.f()+4<=8*h&&o.put(0,4);o.f()%8!=0;)o.m(!1);for(;!(o.f()>=8*h)&&(o.put(236,8),!(o.f()>=8*h));)o.put(17,8);var b=0;for(h=l=0,g=Array(e.length),_=Array(e.length),v=0;v<e.length;v+=1){var x=e[v].j,S=e[v].o-x;for(l=Math.max(l,x),h=Math.max(h,S),g[v]=Array(x),y=0;y<g[v].length;y+=1)g[v][y]=255&o.B()[y+b];for(b+=x,y=a.C(S),x=r(g[v],y.b()-1).l(y),_[v]=Array(y.b()-1),y=0;y<_[v].length;y+=1)S=y+x.b()-_[v].length,_[v][y]=0<=S?x.c(S):0}for(y=o=0;y<e.length;y+=1)o+=e[y].o;for(o=Array(o),y=b=0;y<l;y+=1)for(v=0;v<e.length;v+=1)y<g[v].length&&(o[b]=g[v][y],b+=1);for(y=0;y<h;y+=1)for(v=0;v<e.length;v+=1)y<_[v].length&&(o[b]=_[v][y],b+=1);p=o}for(e=p,o=-1,l=f-1,h=7,g=0,i=a.F(i),_=f-1;0<_;_-=2)for(_==6&&--_;;){for(v=0;2>v;v+=1)d[l][_-v]??(y=!1,g<e.length&&(y=(e[g]>>>h&1)==1),i(l,_-v)&&(y=!y),d[l][_-v]=y,--h,h==-1&&(g+=1,h=7));if(l+=o,0>l||f<=l){l-=o,o=-o;break}}}var u=i[o],d=null,f=0,p=null,m=[],h={u:function(t){t=e(t),m.push(t),p=null},a:function(e,t){if(0>e||f<=e||0>t||f<=t)throw Error(e+`,`+t);return d[e][t]},h:function(){return f},J:function(){for(var e=0,t=0,n=0;8>n;n+=1){l(!0,n);var r=a.D(h);(n==0||e>r)&&(e=r,t=n)}l(!1,t)}};return h}function r(e,t){if(e.length===void 0)throw Error(e.length+`/`+t);var n=function(){for(var n=0;n<e.length&&e[n]==0;)n+=1;for(var r=Array(e.length-n+t),i=0;i<e.length-n;i+=1)r[i]=e[i+n];return r}(),i={c:function(e){return n[e]},b:function(){return n.length},multiply:function(e){for(var t=Array(i.b()+e.b()-1),n=0;n<i.b();n+=1)for(var a=0;a<e.b();a+=1)t[n+a]^=o.i(o.g(i.c(n))+o.g(e.c(a)));return r(t,0)},l:function(e){if(0>i.b()-e.b())return i;for(var t=o.g(i.c(0))-o.g(e.c(0)),n=Array(i.b()),a=0;a<i.b();a+=1)n[a]=i.c(a);for(a=0;a<e.b();a+=1)n[a]^=o.i(o.g(e.c(a))+t);return r(n,0).l(e)}};return i}n.s=function(e){for(var t=[],n=0;n<e.length;n++){var r=e.charCodeAt(n);128>r?t.push(r):2048>r?t.push(192|r>>6,128|r&63):55296>r||57344<=r?t.push(224|r>>12,128|r>>6&63,128|r&63):(n++,r=65536+((r&1023)<<10|e.charCodeAt(n)&1023),t.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|r&63))}return t};var i={L:1,M:0,Q:3,H:2},a=function(){function e(e){for(var t=0;e!=0;)t+=1,e>>>=1;return t}var t=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]];return{w:function(t){for(var n=t<<10;0<=e(n)-e(1335);)n^=1335<<e(n)-e(1335);return(t<<10|n)^21522},A:function(t){for(var n=t<<12;0<=e(n)-e(7973);)n^=7973<<e(n)-e(7973);return t<<12|n},G:function(e){return t[e-1]},F:function(e){switch(e){case 0:return function(e,t){return(e+t)%2==0};case 1:return function(e){return e%2==0};case 2:return function(e,t){return t%3==0};case 3:return function(e,t){return(e+t)%3==0};case 4:return function(e,t){return(Math.floor(e/2)+Math.floor(t/3))%2==0};case 5:return function(e,t){return e*t%2+e*t%3==0};case 6:return function(e,t){return(e*t%2+e*t%3)%2==0};case 7:return function(e,t){return(e*t%3+(e+t)%2)%2==0};default:throw Error(`bad maskPattern:`+e)}},C:function(e){for(var t=r([1],0),n=0;n<e;n+=1)t=t.multiply(r([1,o.i(n)],0));return t},f:function(e,t){if(e!=4||1>t||40<t)throw Error(`mode: `+e+`; type: `+t);return 10>t?8:16},D:function(e){for(var t=e.h(),n=0,r=0;r<t;r+=1)for(var i=0;i<t;i+=1){for(var a=0,o=e.a(r,i),s=-1;1>=s;s+=1)if(!(0>r+s||t<=r+s))for(var c=-1;1>=c;c+=1)0>i+c||t<=i+c||(s!=0||c!=0)&&o==e.a(r+s,i+c)&&(a+=1);5<a&&(n+=3+a-5)}for(r=0;r<t-1;r+=1)for(i=0;i<t-1;i+=1)a=0,e.a(r,i)&&(a+=1),e.a(r+1,i)&&(a+=1),e.a(r,i+1)&&(a+=1),e.a(r+1,i+1)&&(a+=1),(a==0||a==4)&&(n+=3);for(r=0;r<t;r+=1)for(i=0;i<t-6;i+=1)e.a(r,i)&&!e.a(r,i+1)&&e.a(r,i+2)&&e.a(r,i+3)&&e.a(r,i+4)&&!e.a(r,i+5)&&e.a(r,i+6)&&(n+=40);for(i=0;i<t;i+=1)for(r=0;r<t-6;r+=1)e.a(r,i)&&!e.a(r+1,i)&&e.a(r+2,i)&&e.a(r+3,i)&&e.a(r+4,i)&&!e.a(r+5,i)&&e.a(r+6,i)&&(n+=40);for(i=a=0;i<t;i+=1)for(r=0;r<t;r+=1)e.a(r,i)&&(a+=1);return n+=Math.abs(100*a/t/t-50)/5*10}}}(),o=function(){for(var e=Array(256),t=Array(256),n=0;8>n;n+=1)e[n]=1<<n;for(n=8;256>n;n+=1)e[n]=e[n-4]^e[n-5]^e[n-6]^e[n-8];for(n=0;255>n;n+=1)t[e[n]]=n;return{g:function(e){if(1>e)throw Error(`glog(`+e+`)`);return t[e]},i:function(t){for(;0>t;)t+=255;for(;256<=t;)t-=255;return e[t]}}}(),s=function(){function e(e,n){switch(n){case i.L:return t[4*(e-1)];case i.M:return t[4*(e-1)+1];case i.Q:return t[4*(e-1)+2];case i.H:return t[4*(e-1)+3]}}var t=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]];return{I:function(t,n){var r=e(t,n);if(r===void 0)throw Error(`bad rs block @ typeNumber:`+t+`/errorCorrectLevel:`+n);t=r.length/3,n=[];for(var i=0;i<t;i+=1)for(var a=r[3*i],o=r[3*i+1],s=r[3*i+2],c=0;c<a;c+=1){var l=s,u={};u.o=o,u.j=l,n.push(u)}return n}}}();return n}());var Le=QrCreator;const Re=c`:host {
color-scheme: light dark;
display: block;
container-type: inline-size;
container-name: wlcard;
--wl-accent: var(--primary-color);
--wl-badge-pad-x: 8px;
--wl-badge-width: calc(0.85rem * 2.4 + var(--wl-badge-pad-x) * 2);
--stops-ahead-dot-size: 10px;
--stops-ahead-line-width: 2px;
--stops-ahead-name-gap: var(--ha-space-2, 8px);
--wl-row-pad-left: calc(
var(--stops-ahead-dot-size) / 2 - var(--stops-ahead-line-width) / 2
);
--wl-accent-text: var(--primary-text-color);
--wl-rt:      var(--success-color, #43a047);
--wl-warning: var(--warning-color, #ffa000);
--wl-error:   var(--error-color,   #db4437);
--wl-info:    var(--info-color,    #1565c0);
--wl-a11y:    #0072CE;
--wl-cooling: #3276AE;
--wl-radius-sm: var(--ha-border-radius-sm, 4px);
--wl-radius-md: var(--ha-border-radius-md, 8px);
--wl-radius-lg: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
--wl-pad-x:     var(--ha-space-4, 16px);
--wl-pad-y:     var(--ha-space-3, 12px);
--wl-row-gap:   var(--ha-space-3, 12px);
--wl-tile-size: 40px;
--wl-slot-radius: var(--ha-border-radius-md, 8px);
--wl-slot-gap: 6px;
--wl-slot-min-h: 44px;
--wl-metric-size: 2.25rem;
}
ha-card {
overflow: hidden;
}
.wrap {
display: flex;
flex-direction: column;
gap: var(--wl-row-gap);
padding: var(--wl-pad-y) var(--wl-pad-x);
}
.tabbar {
display: flex;
align-items: stretch;
height: 44px;
padding: 0 14px;
border-bottom: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
}
.tabs {
display: flex;
flex: 1;
min-width: 0;
overflow-x: auto;
scrollbar-width: none;
}
.tabs::-webkit-scrollbar {
display: none;
}
.tab-actions {
display: flex;
align-items: center;
justify-content: flex-end;
gap: 2px;
flex: 0 0 auto;
padding-left: 8px;
}
.tab-actions.reserved {
min-width: 66px;
}
.tab-actions .icon-action {
width: 32px;
height: 32px;
}
.tab-actions .icon-action ha-icon {
--mdc-icon-size: 18px;
}
.tab {
flex: 1 0 auto;
min-width: 0;
padding: 0 12px;
background: none;
border: none;
color: var(--secondary-text-color);
font-family: inherit;
font-size: 0.85rem;
font-weight: 500;
cursor: pointer;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
transition: color var(--ha-animation-duration-fast, 150ms) ease, box-shadow var(--ha-animation-duration-fast, 150ms) ease;
}
.tab:hover {
color: var(--primary-text-color);
}
.tab.active {
color: var(--primary-color);
font-weight: var(--ha-font-weight-bold, 700);
box-shadow: inset 0 -2px 0 var(--primary-color);
}
.station {
position: relative;
display: flex;
flex-direction: column;
gap: var(--wl-row-gap);
background-image: radial-gradient(
ellipse 80% 70% at top left,
color-mix(in srgb, var(--wl-accent) 6%, transparent),
transparent 70%
);
}
.station + .station {
margin-top: var(--wl-row-gap);
padding-top: var(--wl-row-gap);
border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
}
.head {
display: flex;
align-items: center;
gap: 12px;
}
.icon-tile {
width: var(--wl-tile-size);
height: var(--wl-tile-size);
border-radius: var(--wl-radius-md);
background: color-mix(in srgb, var(--wl-accent) 18%, transparent);
color: var(--wl-accent-text);
display: inline-flex;
align-items: center;
justify-content: center;
flex-shrink: 0;
forced-color-adjust: none;
}
.icon-tile ha-icon {
--mdc-icon-size: 22px;
}
.title-block {
display: flex;
flex-direction: column;
min-width: 0;
flex: 1;
}
.title {
margin: 0;
font-size: var(--ha-font-size-m, 14px);
font-weight: 600;
color: var(--primary-text-color);
line-height: 1.2;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
}
.subtitle {
margin: 2px 0 0;
font-size: 0.75rem;
color: var(--secondary-text-color);
line-height: 1.2;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
}
.head-actions {
display: inline-flex;
align-items: center;
gap: 4px;
margin-left: auto;
}
.icon-action {
display: inline-flex;
align-items: center;
justify-content: center;
box-sizing: border-box;
flex: 0 0 auto;
padding: 0;
width: 40px;
height: 40px;
border-radius: 50%;
background: transparent;
color: var(--secondary-text-color);
text-decoration: none;
border: none;
cursor: pointer;
transition: background-color var(--ha-animation-duration-fast, 150ms) ease, color var(--ha-animation-duration-fast, 150ms) ease;
}
.icon-action:hover {
background: color-mix(in srgb, var(--primary-color) 12%, transparent);
color: var(--primary-text-color);
}
.icon-action ha-icon {
--mdc-icon-size: 20px;
display: flex;
align-items: center;
justify-content: center;
width: var(--mdc-icon-size);
height: var(--mdc-icon-size);
}
.hero {
display: grid;
grid-template-columns: auto 1fr;
column-gap: var(--ha-space-3, 12px);
--wl-hero-row-gap: 6px;
row-gap: 0;
align-items: center;
}
.hero > .hero-time {
grid-column: 1;
grid-row: 1;
align-self: center;
margin-block: calc(var(--wl-metric-size) / -2);
translate: 0 calc(var(--wl-metric-size) * -0.05);
}
.hero > .hero-entry {
grid-column: 2;
}
.hero > .hero-entry ~ .hero-entry {
margin-top: var(--wl-hero-row-gap);
}
.hero > .hero-detail {
grid-column: 1 / -1;
}
.hero-time {
display: flex;
align-items: baseline;
gap: 4px;
color: var(--wl-accent-text);
}
.hero-min {
font-family: "WL Sans", var(--ha-font-family-body, system-ui), sans-serif;
font-size: var(--wl-metric-size);
font-weight: 700;
font-variant-numeric: tabular-nums;
line-height: 1;
letter-spacing: -0.5px;
}
.hero-unit {
font-size: var(--ha-font-size-m, 1rem);
font-weight: 600;
color: var(--secondary-text-color);
}
.hero-host {
display: flex;
flex-direction: column;
min-width: 0;
padding: var(--ha-space-3, 12px) var(--wl-pad-x);
background: color-mix(in srgb, var(--wl-accent) 12%, transparent);
border-radius: var(--wl-radius-lg);
}
.hero-entry {
display: flex;
flex-wrap: wrap;
align-items: center;
gap: 8px;
min-width: 0;
}
.hero-entry.expandable {
cursor: pointer;
user-select: none;
border-radius: 6px;
position: relative;
}
.hero-entry .type-icon {
margin-right: 0;
}
.hero-chevron {
--mdc-icon-size: 18px;
color: var(--secondary-text-color);
margin-left: auto;
flex-shrink: 0;
will-change: transform;
transition: transform
var(--ha-animation-duration-fast, 150ms)
ease;
}
.hero-entry.expanded .hero-chevron {
transform: rotate(180deg);
}
.hero-detail {
display: grid;
grid-template-rows: 0fr;
transition:
grid-template-rows 0.24s ease,
margin-top 0.24s ease;
}
.hero-detail-inner {
overflow: hidden;
min-height: 0;
}
.hero-detail.expanded {
grid-template-rows: 1fr;
margin-top: var(--wl-hero-row-gap);
}
.hero-direction {
font-weight: 500;
color: var(--primary-text-color);
flex: 1 1 0;
min-width: 0;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
}
.hero-platform {
font-size: var(--ha-font-size-xs, 10px);
font-weight: 500;
color: var(--primary-text-color);
font-variant-numeric: tabular-nums;
padding: 2px 8px;
border-radius: 999px;
background: color-mix(
in srgb,
var(--primary-text-color) 10%,
transparent
);
}
.hero-a11y,
.hero-cooling {
display: inline-flex;
align-items: center;
justify-content: center;
width: 24px;
height: 24px;
border-radius: 50%;
flex-shrink: 0;
forced-color-adjust: none;
color: #fff;
}
.hero-a11y {
background: var(--wl-a11y);
}
.hero-cooling {
background: var(--wl-cooling);
}
.hero-a11y ha-icon,
.hero-cooling ha-icon {
--mdc-icon-size: 16px;
display: flex;
align-items: center;
justify-content: center;
width: 16px;
height: 16px;
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
height: 32px;
padding: 0 14px;
border: none;
border-radius: 999px;
background: var(--wl-warning);
color: var(--text-primary-color, #fff);
font-family: inherit;
font-size: 0.75rem;
font-weight: 600;
cursor: pointer;
box-shadow: 0 1px 2px color-mix(in srgb, #000 12%, transparent);
transition: filter var(--ha-animation-duration-fast, 150ms) ease, transform 0.06s ease;
forced-color-adjust: none;
}
.banner > button:hover {
filter: brightness(1.08);
}
.banner > button:active {
transform: translateY(1px);
}
.alert-list {
display: flex;
flex-direction: column;
gap: 6px;
}
.alert {
display: flex;
gap: 10px;
align-items: flex-start;
padding: 10px 12px;
border-radius: var(--wl-radius-md);
background: color-mix(in srgb, var(--wl-warning) 12%, transparent);
box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wl-warning) 22%, transparent);
font-size: 0.85rem;
cursor: pointer;
user-select: none;
forced-color-adjust: none;
}
.alert.no-detail {
cursor: default;
}
.alert > ha-icon {
--mdc-icon-size: 18px;
color: var(--wl-warning);
flex-shrink: 0;
margin-top: 1px;
}
.alert-body {
display: flex;
flex-direction: column;
gap: 4px;
min-width: 0;
flex: 1;
}
.alert-summary {
display: flex;
align-items: center;
flex-wrap: wrap;
gap: 6px 8px;
}
.alert-title {
font-weight: 600;
color: var(--primary-text-color);
}
.lift-path {
display: inline;
}
.lift-path-sep {
margin: 0 5px;
color: var(--secondary-text-color);
font-weight: 400;
}
.lift-reason {
display: flex;
align-items: flex-start;
gap: 6px;
}
.lift-reason ha-icon {
--mdc-icon-size: 16px;
flex-shrink: 0;
margin-top: 1px;
color: var(--wl-accent-text);
}
.alert-lines {
display: inline-flex;
flex-wrap: wrap;
gap: 4px;
}
.alert-line-badge {
display: inline-block;
padding: 1px 6px;
border-radius: 4px;
font-size: 0.78rem;
font-weight: var(--ha-font-weight-bold, 700);
color: #fff;
background: var(--primary-color);
forced-color-adjust: none;
}
.alert-detail {
display: grid;
grid-template-rows: 0fr;
transition: grid-template-rows 0.24s ease;
}
.alert-detail > .alert-detail-inner {
overflow: hidden;
min-height: 0;
display: flex;
flex-direction: column;
gap: 4px;
}
.alert.expanded .alert-detail {
grid-template-rows: 1fr;
}
.alert-desc {
color: var(--secondary-text-color);
line-height: 1.45;
}
.alert-desc p {
margin: 0 0 8px;
}
.alert-desc p:last-child {
margin-bottom: 0;
}
.alert-desc-heading {
margin: 14px 0 6px;
padding-left: 8px;
border-left: 3px solid var(--wl-accent);
color: var(--primary-text-color);
font-size: 0.78rem;
font-weight: 700;
letter-spacing: 0.06em;
text-transform: uppercase;
line-height: 1.3;
}
.alert-desc-heading:first-child {
margin-top: 0;
}
.alert-facts {
display: grid;
gap: 4px 10px;
margin: 10px 0 0;
padding-top: 8px;
border-top: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
}
.alert-fact {
display: grid;
grid-template-columns: auto 1fr;
gap: 4px 10px;
align-items: baseline;
}
.alert-fact dt {
display: inline-flex;
align-items: center;
gap: 4px;
color: var(--secondary-text-color);
font-size: 0.68rem;
font-weight: 700;
letter-spacing: 0.06em;
text-transform: uppercase;
line-height: 1.5;
white-space: nowrap;
}
.alert-fact dt ha-icon {
--mdc-icon-size: 14px;
flex-shrink: 0;
color: var(--wl-accent-text);
}
.alert-fact dd {
margin: 0;
color: var(--primary-text-color);
}
@container wlcard (inline-size < 360px) {
.alert-fact {
grid-template-columns: 1fr;
gap: 0;
}
}
.alert-meta {
display: inline-flex;
flex-wrap: wrap;
align-items: center;
gap: 10px;
color: var(--secondary-text-color);
font-size: 0.78rem;
font-variant-numeric: tabular-nums;
}
.alert-location-chip {
display: inline-flex;
align-items: center;
gap: 3px;
}
.alert-location-chip ha-icon {
--mdc-icon-size: 14px;
color: var(--secondary-text-color);
}
.alert-chevron {
margin-left: auto;
--mdc-icon-size: 20px;
color: var(--secondary-text-color);
transition: transform var(--ha-animation-duration-fast, 150ms) ease;
flex-shrink: 0;
}
.alert.expanded .alert-chevron {
transform: rotate(180deg);
}
@supports (width: round(down, 1px, 1px)) {
:host {
--wl-badge-width: round(
down,
calc(0.85rem * 2.4 + var(--wl-badge-pad-x) * 2),
1px
);
}
}
.dep-list {
list-style: none;
margin: 0;
padding: 0;
display: flex;
flex-direction: column;
--wl-dep-col-gap: var(--ha-space-2, 8px);
--wl-trail-x: calc(var(--stops-ahead-dot-size) / 2);
}
.dep-row {
display: grid;
grid-template-columns: max-content 1fr auto auto auto;
align-items: center;
gap: var(--wl-dep-col-gap);
padding: var(--ha-space-2, 8px) var(--wl-row-pad-left);
border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
transition: background-color
var(--ha-animation-duration-fast, 150ms)
ease;
}
.dep-row:last-child {
border-bottom: none;
}
.dep-row:hover {
background: color-mix(
in srgb,
var(--primary-text-color) 4%,
transparent
);
}
.dep-row.expandable {
cursor: pointer;
user-select: none;
position: relative;
border-bottom: none;
}
.row-chevron {
--mdc-icon-size: 18px;
color: var(--secondary-text-color);
flex-shrink: 0;
transition: transform
var(--ha-animation-duration-fast, 150ms)
ease;
}
.dep-row.expanded .row-chevron {
transform: rotate(180deg);
}
.dep-row.expanded::after {
content: "";
position: absolute;
left: calc(var(--wl-trail-x) - var(--stops-ahead-line-width) / 2);
top: 50%;
bottom: 0;
width: var(--stops-ahead-line-width);
background: var(--stops-ahead-line, var(--primary-color));
}
.dep-row.expanded .line-badge {
border-bottom-left-radius: 0;
}
.dep-row-detail {
display: grid;
grid-template-rows: 0fr;
transition: grid-template-rows 0.24s ease;
list-style: none;
border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
}
.dep-row-detail:last-child {
border-bottom: none;
}
.dep-row-detail-inner {
overflow: hidden;
min-height: 0;
}
.dep-row-detail.expanded {
grid-template-rows: 1fr;
}
.stops-ahead {
--stops-ahead-line: var(--primary-color);
--stops-ahead-gap: var(--ha-space-2, 8px);
list-style: none;
margin: 0;
padding: var(--stops-ahead-gap) var(--ha-space-2, 8px)
var(--stops-ahead-gap) 0;
position: relative;
display: flex;
flex-direction: column;
gap: var(--stops-ahead-gap);
color: var(--secondary-text-color);
font-size: 0.85rem;
line-height: 1.3;
}
.stops-ahead-stop:not(:first-child)::before,
.dep-row-detail .stops-ahead-stop::before,
.stops-ahead-stop:not(:last-child)::after {
content: "";
position: absolute;
left: calc(var(--stops-ahead-dot-size) / 2 - var(--stops-ahead-line-width) / 2);
width: var(--stops-ahead-line-width);
background: var(--stops-ahead-line);
}
.stops-ahead-stop:not(:first-child)::before,
.dep-row-detail .stops-ahead-stop::before {
top: calc(-1 * var(--stops-ahead-gap));
height: calc(50% + var(--stops-ahead-gap));
}
.stops-ahead-stop:not(:last-child)::after {
top: 50%;
bottom: 0;
}
.dep-row-detail .stops-ahead {
padding-left: calc(var(--wl-trail-x) - var(--stops-ahead-dot-size) / 2);
}
.stops-ahead-stop {
position: relative;
display: flex;
flex-direction: column;
gap: var(--ha-space-1, 4px);
padding-left: calc(
var(--stops-ahead-dot-size) + var(--stops-ahead-name-gap)
);
min-height: var(--stops-ahead-dot-size);
}
.stops-ahead-row {
display: flex;
align-items: center;
gap: var(--ha-space-2, 8px);
min-height: var(--stops-ahead-dot-size);
}
.stops-ahead-row[role="button"] {
cursor: pointer;
}
.stops-ahead-dot {
position: absolute;
left: 0;
top: 50%;
transform: translateY(-50%);
width: var(--stops-ahead-dot-size);
height: var(--stops-ahead-dot-size);
border-radius: 50%;
background: var(--stops-ahead-line);
z-index: 1;
forced-color-adjust: none;
}
.stops-ahead-name {
color: var(--primary-text-color);
flex: 0 1 auto;
min-width: 0;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
}
.stops-ahead-stop.terminus .stops-ahead-name {
font-weight: 600;
}
.stops-ahead-stop.terminus .stops-ahead-dot {
background: var(--card-background-color, var(--ha-card-background, #fff));
box-shadow: inset 0 0 0 var(--stops-ahead-line-width) var(--stops-ahead-line);
}
.stops-ahead-metros {
display: inline-flex;
flex-wrap: wrap;
gap: var(--ha-space-1, 4px);
flex-shrink: 0;
}
.stops-ahead-line-chip {
display: inline-block;
padding: 1px 6px;
border-radius: 4px;
font-size: 0.7rem;
font-weight: var(--ha-font-weight-bold, 700);
color: #fff;
background: var(--primary-color);
line-height: 1.4;
forced-color-adjust: none;
}
.stops-ahead-other-toggle {
margin-left: auto;
display: inline-flex;
align-items: center;
gap: 2px;
padding: 1px 4px 1px 6px;
border: 0;
border-radius: 999px;
background: color-mix(
in srgb,
var(--secondary-text-color) 14%,
transparent
);
color: var(--secondary-text-color);
font-size: 0.7rem;
font-weight: var(--ha-font-weight-bold, 700);
cursor: pointer;
flex-shrink: 0;
line-height: 1.4;
}
.stops-ahead-other-toggle ha-icon {
--mdc-icon-size: 14px;
transition: transform
var(--ha-animation-duration-fast, 150ms)
ease;
}
.stops-ahead-stop.transfers-expanded .stops-ahead-other-toggle ha-icon {
transform: rotate(180deg);
}
.stops-ahead-others {
display: flex;
flex-wrap: wrap;
gap: var(--ha-space-1, 4px);
}
.stops-ahead-line-chip--other {
opacity: 0.92;
}
.line-badge {
position: relative;
z-index: 1;
transition: border-radius
var(--ha-animation-duration-fast, 150ms)
ease;
text-align: center;
font-family: "WL Sans", var(--ha-font-family-body, system-ui), sans-serif;
font-weight: 700;
color: #fff;
border-radius: 6px;
padding: 3px var(--wl-badge-pad-x);
min-width: calc(var(--wl-badge-width) - var(--wl-badge-pad-x) * 2);
font-size: 0.85rem;
background: var(--primary-color);
forced-color-adjust: none;
}
.towards {
display: flex;
align-items: baseline;
min-width: 0;
color: var(--primary-text-color);
}
.towards-rows {
display: flex;
flex-wrap: wrap;
align-items: baseline;
column-gap: 6px;
row-gap: 2px;
flex: 1 1 auto;
min-width: 0;
}
.towards-name {
flex: 1 1 auto;
min-width: 0;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
}
.type-icon {
--mdc-icon-size: 16px;
color: var(--secondary-text-color);
margin-right: 4px;
vertical-align: 1px;
}
.delay {
color: var(--wl-warning);
font-size: 0.85rem;
font-weight: 500;
white-space: nowrap;
flex-shrink: 0;
}
.row-end {
display: inline-flex;
align-items: center;
gap: 6px;
}
.row-platform {
font-size: var(--ha-font-size-xs, 10px);
color: var(--secondary-text-color);
font-variant-numeric: tabular-nums;
white-space: nowrap;
padding: 1px 6px;
border-radius: 4px;
background: color-mix(
in srgb,
var(--secondary-text-color) 12%,
transparent
);
}
.row-flags {
display: inline-flex;
align-items: center;
gap: 4px;
color: var(--secondary-text-color);
}
.row-flags ha-icon {
--mdc-icon-size: 16px;
}
.row-flags .disturbance {
color: var(--wl-warning);
}
.countdown {
font-family: "WL Sans", var(--ha-font-family-body, system-ui), sans-serif;
font-variant-numeric: tabular-nums;
font-weight: 700;
min-width: 50px;
text-align: right;
color: var(--secondary-text-color);
white-space: nowrap;
}
.countdown.now   { color: var(--wl-accent-text); }
.countdown.late  { color: var(--wl-error); }
.countdown.early { color: var(--wl-rt); }
.empty {
padding: 18px 0;
color: var(--secondary-text-color);
text-align: center;
font-size: 0.85rem;
}
.empty.stale {
padding: 18px 12px;
display: flex;
flex-direction: column;
gap: 4px;
}
.empty .empty-title {
font-weight: 500;
color: var(--primary-text-color);
}
.empty .empty-detail {
max-width: 34em;
margin: 0 auto;
line-height: 1.4;
}
.empty .empty-meta {
font-size: 0.78rem;
opacity: 0.75;
}
.stale-note {
padding: 4px 0 8px;
color: var(--secondary-text-color);
font-size: 0.78rem;
}
.foot {
display: flex;
align-items: center;
gap: 10px;
padding: 8px 0;
margin-top: calc(-1 * var(--wl-row-gap));
margin-bottom: calc(-1 * var(--wl-pad-y));
border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
font-size: 0.7rem;
color: var(--secondary-text-color);
}
.timestamp {
margin-left: auto;
}
.dev-strip {
display: flex;
align-items: center;
gap: 6px;
padding: 6px 10px;
border: 1px dashed var(--secondary-text-color, rgba(0, 0, 0, 0.3));
border-radius: var(--wl-radius-sm);
font-size: 0.7rem;
color: var(--secondary-text-color);
}
.dev-strip-label {
font-weight: 600;
letter-spacing: 0.5px;
text-transform: uppercase;
}
.dev-strip button {
padding: 4px 10px;
border-radius: var(--wl-radius-sm);
border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.2));
background: transparent;
color: var(--primary-text-color);
font-family: inherit;
font-size: 0.78rem;
cursor: pointer;
}
.dev-strip button:hover {
opacity: 0.8;
}
.dev-strip .dev-strip-clear {
margin-left: auto;
color: var(--secondary-text-color);
}
.dev-palette {
display: flex;
flex-direction: column;
gap: 4px;
margin-top: 6px;
padding: 8px;
border: 1px dashed var(--secondary-text-color, rgba(0, 0, 0, 0.3));
border-radius: var(--wl-radius-sm);
overflow-x: auto;
}
.dev-pal-row {
display: grid;
grid-template-columns: 8.5rem 1fr 1fr;
align-items: stretch;
gap: 6px;
min-width: 30rem;
}
.dev-pal-id {
display: flex;
flex-direction: column;
justify-content: center;
gap: 3px;
min-width: 0;
}
.dev-pal-id code {
font-size: 0.62rem;
color: var(--secondary-text-color);
}
.dev-pal-badge {
align-self: flex-start;
padding: 2px 6px;
border-radius: 4px;
font-size: 0.68rem;
font-weight: 700;
color: #fff;
forced-color-adjust: none;
}
.dev-pal-scheme {
display: flex;
align-items: center;
gap: 5px;
padding: 5px 6px;
border-radius: var(--wl-radius-sm);
border: 1px solid rgba(128, 128, 128, 0.35);
}
.dev-pal-scheme-label {
font-size: 0.58rem;
letter-spacing: 0.06em;
text-transform: uppercase;
color: #8a8a8a;
flex-shrink: 0;
}
.dev-pal-chip {
display: flex;
align-items: baseline;
gap: 5px;
padding: 4px 6px;
border-radius: 4px;
min-width: 0;
}
.dev-pal-word {
font-weight: 700;
font-size: 0.85rem;
white-space: nowrap;
}
.dev-pal-ratio {
font-size: 0.62rem;
font-variant-numeric: tabular-nums;
}
.dev-pal-ratio.pass {
color: #4caf50;
}
.dev-pal-ratio.fail {
color: #ff5252;
}
.dev-pal-surface {
font-size: 0.55rem;
color: #8a8a8a;
}
.dev-pal-out {
margin-left: auto;
font-size: 0.6rem;
color: #8a8a8a;
}
.qr-toggle.expanded {
background: color-mix(in srgb, var(--primary-color) 14%, transparent);
color: var(--primary-text-color);
}
.qr-panel {
display: grid;
grid-template-rows: 0fr;
transition: grid-template-rows 0.24s ease;
}
.qr-panel.expanded {
grid-template-rows: 1fr;
}
.qr-panel-inner {
overflow: hidden;
min-height: 0;
}
.qr-panel-body {
display: flex;
flex-direction: column;
align-items: center;
gap: 8px;
padding: 12px 0 4px;
cursor: pointer;
}
.qr-canvas {
padding: 10px;
background: #fff;
border-radius: var(--wl-radius-md);
line-height: 0;
forced-color-adjust: none;
}
.qr-canvas canvas {
display: block;
width: 100%;
max-width: 220px;
height: auto;
}
.qr-panel-hint {
margin: 0;
text-align: center;
font-size: 0.78rem;
color: var(--secondary-text-color);
line-height: 1.4;
max-width: 280px;
}
@container wlcard (inline-size < 360px) {
:host {
--wl-pad-x: 12px;
--wl-pad-y: 12px;
--wl-tile-size: 36px;
--wl-slot-min-h: 40px;
--wl-metric-size: 2rem;
}
.tabs {
padding: 0 8px;
}
.tab {
padding: 0 8px;
font-size: 0.8125rem;
}
}
@container wlcard (inline-size < 420px) {
.hero {
display: flex;
flex-direction: column;
align-items: stretch;
}
.hero > .hero-time {
align-self: stretch;
margin-block: 0 var(--wl-hero-row-gap);
}
}
@container wlcard (inline-size > 480px) {
:host {
--wl-pad-x: 20px;
--wl-pad-y: 16px;
--wl-tile-size: 44px;
--wl-metric-size: 2.5rem;
}
.icon-tile ha-icon {
--mdc-icon-size: 24px;
}
.dep-list {
--wl-trail-x: calc(
var(--wl-row-pad-left) + var(--wl-badge-width) -
var(--stops-ahead-line-width) / 2
);
}
.towards {
margin-left: calc(
var(--stops-ahead-dot-size) / 2 - var(--stops-ahead-line-width) / 2 +
var(--stops-ahead-name-gap) - var(--wl-dep-col-gap)
);
}
.dep-row.expanded .line-badge {
border-bottom-left-radius: 6px;
border-bottom-right-radius: 0;
}
.hero {
--wl-hero-trail-x: calc(var(--stops-ahead-dot-size) / 2);
}
.hero-entry {
padding-left: var(--wl-row-pad-left);
align-self: stretch;
}
.hero-detail .stops-ahead {
padding-left: calc(
var(--wl-hero-trail-x) - var(--stops-ahead-dot-size) / 2
);
}
.hero-detail .stops-ahead-stop::before {
content: "";
position: absolute;
left: calc(
var(--stops-ahead-dot-size) / 2 - var(--stops-ahead-line-width) / 2
);
width: var(--stops-ahead-line-width);
background: var(--stops-ahead-line);
top: calc(-1 * var(--stops-ahead-gap));
height: calc(50% + var(--stops-ahead-gap));
}
.hero-entry.expanded::after {
content: "";
position: absolute;
left: calc(
var(--wl-hero-trail-x) - var(--stops-ahead-line-width) / 2
);
top: 50%;
bottom: calc(-1 * var(--wl-hero-row-gap));
width: var(--stops-ahead-line-width);
background: var(--stops-ahead-line, var(--primary-color));
}
.hero-entry.expanded .line-badge {
border-bottom-left-radius: 0;
}
.hero > .hero-detail {
grid-column: 2;
}
}
.tab:focus-visible,
.alert:focus-visible,
.dep-row.expandable:focus-visible,
.hero-entry.expandable:focus-visible,
.stops-ahead-other-toggle:focus-visible,
.icon-action:focus-visible,
a:focus-visible,
button:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
border-radius: 6px;
}
.icon-action:focus-visible {
border-radius: 50%;
}
@media (forced-colors: active) {
.icon-tile,
.line-badge,
.alert,
.dep-row {
forced-color-adjust: none;
outline: 1px solid CanvasText;
}
}
@keyframes wlRowReveal {
from {
opacity: 0;
transform: translateY(4px);
}
to {
opacity: 1;
transform: none;
}
}
.dep-row,
.hero-host {
animation: wlRowReveal 360ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
animation-delay: calc(min(var(--row-i, 0), 6) * 55ms);
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
}`,ze=`wl-austria-fonts`;function Be(){if(typeof document>`u`||document.getElementById(ze))return;let e=document.createElement(`style`);e.id=ze,e.textContent=`
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
`,document.head.appendChild(e)}const Ve=`#1b1464`;var He=t({common:()=>Ue,default:()=>qe,flap:()=>Ke,modern:()=>We,retro:()=>Ge}),Ue={editor:{add_chip:`Chip hinzufügen`,add_icon:`Symbol hinzufügen`,date_format_placeholder:`d.m.Y`,direction_label:`Fahrtrichtung`,direction_not_served:`nicht bedient`,direction_note_one_way:`Rückfahrt deaktiviert: {line} endet hier.`,direction_unavailable:`Keine Abfahrten in dieser Richtung`,entities:`Haltestellen`,entity:`Haltestelle`,header_amenities:`Symbole in diesem Slot`,header_bar_aria:`Stationsanzeige — Seite wählen`,header_chips_and_icons:`Textchips (max. {chips}) und Extra-Symbole (max. {icons})`,header_left:`Linke Seite`,header_pick_side_hint:`Seite antippen, dann unten füllen`,header_right:`Rechte Seite`,header_side_aria:`Seite der Stationsanzeige`,header_slot_empty:`leer`,line_active_aria:`Linie {line} aktiv`,line_inactive_aria:`Linie {line} inaktiv`,lines_empty_means_all:`leer = alle Linien`,lines_label:`Linien an dieser Haltestelle`,lines_selected:`{n} von {total}`,no_lines_hint:`Die Linien erscheinen, sobald diese Haltestelle Abfahrten meldet.`,no_lines_title:`Noch keine Linien verfügbar`,per_line_direction_aria:`Linie {line}: {direction}`,remove_chip_aria:`Chip {chip} entfernen`,remove_icon_aria:`Symbol {icon} entfernen`,remove_stop:`Haltestelle entfernen`,section_board:`Fallblatt-Tafel`,section_departure_row:`Abfahrtszeile`,section_extras:`Extras`,section_extras_hint:`optional`,section_footer:`Fußzeile`,section_header:`Stationsanzeige`,section_header_hint:`Direkt am Balken`,section_led_panel:`LED-Anzeige`,section_station:`Stationsband`,section_walk_time:`Gehzeit zur Haltestelle`,show_clock_short:`Uhr`,show_date_short:`Datum`,show_elevator_short:`Lift`,show_escalator_short:`Rolltreppe`,show_wc_short:`WC`,size_medium:`Mittel`,size_regular:`Standard`,size_small:`Klein`,tab_display:`Anzeige`,tab_stop:`Haltestelle`,tab_stops:`Haltestellen`,tab_tweaks:`Stil`,text_placeholder:`z. B. Name der nächsten Station`,walk_time_aria:`Gehzeit in Minuten für Linie {line} Richtung {towards}`,walk_time_branching_hint:`Gilt für alle Endstationen in dieser Richtung`,walk_time_hint:`Blendet Abfahrten aus, die ohne dich abfahren würden. Leer = kein Filter.`,walk_time_less_aria:`Gehzeit für Linie {line} verringern`,walk_time_more_aria:`Gehzeit für Linie {line} erhöhen`,walk_time_placeholder:`–`,walk_time_unit:`Minuten`}},We={no_data:`Keine Abfahrten verfügbar`,betriebsschluss:`Betriebsschluss`,stale_feed:`Keine aktuellen Daten`,stale_feed_detail:`Die Wiener Linien melden für diese Haltestelle veraltete Abfahrtszeiten. Sobald wieder Echtzeitdaten kommen, füllt sich die Anzeige automatisch.`,stale_feed_since:`Letzte gemeldete Abfahrt: {time}`,stale_feed_partial:`Einzelne Linien melden keine aktuellen Zeiten.`,min:`Min`,now:`Jetzt`,platform_short_rail:`Gleis`,platform_short_bus:`Steig`,version_update:`Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.`,entity_missing:`Sensor {entity} existiert nicht mehr. Wähle einen anderen Sensor oder entferne ihn aus den Haltestellen dieser Karte.`,no_entities_picked:`Keine Haltestelle ausgewählt`,no_entities_available:`Keine Wiener-Linien-Sensoren gefunden`,departures_list:`Kommende Abfahrten`,barrier_free_title:`Barrierefrei zugänglich`,cooling_title:`Klimatisiert`,disturbance_title:`Verkehrsbehinderung gemeldet`,stops_ahead_aria_show:`Streckenverlauf für {line} Richtung {towards} anzeigen`,stops_ahead_aria_hide:`Streckenverlauf für {line} Richtung {towards} ausblenden`,stops_ahead_other_show:`{count} weitere Linien bei {stop} anzeigen`,stops_ahead_other_hide:`Weitere Linien bei {stop} ausblenden`,dir_h:`Hinfahrt`,dir_r:`Rückfahrt`,dir_h_short:`H`,dir_r_short:`R`,dir_both:`Beide`,traffic_label:`Störung`,traffic_until:`Bis`,traffic_updated:`aktualisiert`,elevator_until:`Bis`,open_in_maps:`In Karte öffnen`,qr_open:`QR-Code anzeigen`,qr_dialog_title:`QR-Code für Haltestelle`,qr_dialog_hint:`Mit dem Smartphone scannen — öffnet die Haltestelle in der Karten-App.`,qr_dialog_close:`QR-Code schließen`,delay_singular:`1 Min. verspätet`,delay_plural:`{n} Min. verspätet`,devmode_title:`DEV`,devmode_traffic_btn:`Störung testen`,devmode_elevator_btn:`Aufzug testen`,devmode_colors_btn:`Linienfarben`,devmode_clear_btn:`Löschen`,editor:{accessibility_only:`Nur barrierefreie Abfahrten anzeigen`,accessibility_only_requires:`Braucht „Barrierefrei-Symbol anzeigen“.`,colors_empty_hint:`Wähle im ersten Reiter Haltestellen aus — ihre Linien erscheinen dann hier.`,colors_hint:`Optional. Ohne Überschreibung gilt die offizielle Linienfarbe.`,hide_attribution:`Datenquelle ausblenden`,hide_attribution_helper:`Wenn aktiv, wird die Quellenangabe ausgeblendet.`,hide_header:`Kopfzeile ausblenden`,hide_header_helper:`Wenn aktiv, wird die Titelleiste der Karte ausgeblendet.`,layout:`Layout mehrerer Haltestellen`,layout_requires:`Wirkt erst ab zwei Haltestellen.`,layout_stacked:`Gestapelt`,layout_tabs:`Reiter`,max_departures:`Anzahl Abfahrten pro Haltestelle`,pick_color_for_line:`Farbe für Linie {line} wählen`,reset_color:`Auf Standard zurücksetzen`,reset_color_aria:`Linienfarbe {line} auf Standard zurücksetzen`,section_colors:`Linienfarben`,section_colors_hint:`überschreibt API-Farbe`,section_departure_row_hint:`pro Zeile`,section_disruptions:`Störungen & Verspätungen`,section_layout:`Aufbau`,section_layout_hint:`Struktur`,show_accessibility:`Barrierefrei-Symbol anzeigen`,show_cooling:`Klimaanlagen-Symbol anzeigen`,show_cooling_helper:`Zeigt eine Schneeflocke neben Abfahrten mit klimatisiertem Fahrzeug. Wiener Linien melden das pro Fahrzeug — ältere Garnituren liefern die Angabe nicht.`,show_delay:`Verspätungen anzeigen`,show_delay_colors:`Verspätungen farblich hervorheben`,show_delay_colors_helper:`Färbt die Minutenzahl rot, wenn eine Abfahrt verspätet ist, und grün, wenn sie zu früh kommt.`,show_delay_colors_requires:`Braucht „Verspätungen anzeigen“.`,show_departures:`Abfahrtsliste anzeigen`,show_elevator_info:`Aufzugsausfälle anzeigen`,show_hero_metric:`Nächste Abfahrt groß anzeigen`,show_platform:`Gleis/Steig anzeigen`,show_qr_button:`QR-Code-Schaltfläche anzeigen`,show_stops_ahead:`Zwischenstationen anzeigen`,show_traffic_info:`Störungen anzeigen`,show_type_icon:`Verkehrsmittel-Symbol anzeigen`}},Ge={editor:{accessibility_only:`Nur barrierefreie Abfahrten anzeigen`,chips:`Zusätzliche Beschriftungen`,date_format:`Datumsformat`,exit:`Ausgangssymbol`,extra_icons:`Zusätzliche Symbole`,flicker:`LED-Flackern simulieren`,header_exit_accessible:`Stufenloser Ausgang`,header_exit_none:`Kein`,header_exit_regular:`Ausgang`,housing:`LED-Gehäuserahmen anzeigen`,housing_helper:`Dunkler Rahmen um die LED-Anzeige mit dezentem Glas-Reflex obenauf.`,icon_mdi_door_open:`Offene Tür`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_stairs:`Treppe`,line_stripe:`Seitlichen Linienstreifen anzeigen`,line_stripe_helper:`4-Pixel-Balken am linken Rand jeder Zeile in der Linienfarbe.`,message_text:`Nachricht`,message_text_requires:`Braucht „Lauftext anzeigen“.`,message_ticker:`Laufschrift`,message_ticker_helper:`Zeigt alle 5 Minuten eine eigene Nachricht als Laufschrift über die Anzeige.`,platform_side:`Gleis/Steig-Seite`,platform_side_auto:`Automatisch (1 = rechts, 2 = links)`,platform_side_helper:`Standard folgt der Wiener-Linien-Beschilderung (Gleis 2 links, sonst rechts). Manuell überschreibbar.`,platform_side_left:`Immer links`,platform_side_requires:`Braucht „Steig anzeigen“.`,platform_side_right:`Immer rechts`,show_clock:`Uhr-Plakette anzeigen`,show_date:`Datums-Plakette anzeigen`,show_header:`Stationsanzeige anzeigen`,show_header_helper:`Hauptschalter. Einstellungen pro Seite bleiben gespeichert.`,show_line_pill:`Linien-Plakette anzeigen`,show_line_pill_helper:`Liniencode als gefüllte Plakette in der Linienfarbe statt als schlichter Text.`,show_platform:`Steig anzeigen`,show_station_name:`Stationsnamen anzeigen`,show_unit:`Einheit „min“ anzeigen`,show_unit_helper:`Kleines „min“ in Amber-Versalien nach jeder Minutenzahl.`,size:`Größe`,station_bg:`Stationsschild-Hintergrund`,station_bg_black:`Schwarz`,station_bg_default:`Standard`,station_bg_white:`Weiß`,style:`Stil`,style_classic:`Klassisch`,style_pixel:`Punktmatrix`,style_warm:`Warm`,text:`Beschriftung`,wheelchair_race:`Rollstuhl-Rennen (Easter Egg)`},aria_dismiss_message:`Lauftext schließen`,aria_start_race:`Barrierefreiheits-Rennen starten`,at_platform:`Einfahrt`,barrier_free_title:`Barrierefrei zugänglich`,betriebsschluss:`Betriebsschluss`,countdown_minutes:`{n} Minuten`,departures_list:`Kommende Abfahrten`,dir_both:`Beide`,dir_h:`Hinfahrt`,dir_h_short:`H`,dir_r:`Rückfahrt`,dir_r_short:`R`,entity_missing:`Sensor {entity} existiert nicht mehr. Wähle oben einen anderen Sensor.`,gleis:`GLEIS`,header:{icon_exit:`Ausgang`,icon_exit_access:`Stufenloser Ausgang`,icon_wc:`WC`,icon_escalator:`Rolltreppe`,icon_elevator:`Aufzug`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_door_open:`Offene Tür`,icon_mdi_stairs:`Treppe`},no_data:`Keine Abfahrten`,no_data_wrong_direction:`Keine Abfahrten in dieser Richtung`,no_data_wrong_line:`Keine Abfahrten für diese Linie`,no_entity:`Keine Haltestelle ausgewählt`,race_finished:`Barrierefreiheits-Rennen beendet`,race_starting_in:`Rennen startet in {n}`,race_winner_announce:`Rollstuhl {n} gewinnt das Barrierefreiheits-Rennen`,stale_feed:`Keine aktuellen Daten`,steig:`STEIG`,unit_min:`min`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.`,version_update:`Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden`,via_prefix:`ÜBER`},Ke={no_entity:`Keine Haltestelle ausgewählt`,no_data:`Keine Abfahrten`,no_data_wrong_direction:`Keine Abfahrten in dieser Richtung`,no_data_wrong_line:`Keine Abfahrten für diese Linie`,betriebsschluss:`Betriebsschluss`,stale_feed:`Keine aktuellen Daten`,dir_h:`Hinfahrt`,dir_r:`Rückfahrt`,dir_h_short:`H`,dir_r_short:`R`,gleis:`GLEIS`,steig:`STEIG`,col_line:`LINIE`,col_dest:`RICHTUNG`,col_step_free:`STUFENLOS`,col_cd:`ANKUNFT`,version_update:`Klappanzeige wurde auf v{v} aktualisiert — bitte neu laden`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.`,entity_missing:`Sensor {entity} existiert nicht mehr. Wähle oben einen anderen Sensor.`,departures_list:`Kommende Abfahrten`,at_platform:`Einfahrt`,countdown_minutes:`{n} Minuten`,barrier_free_title:`Barrierefrei zugänglich`,not_barrier_free_title:`Nicht barrierefrei`,unit_min:`min`,dir_both:`Beide`,header:{icon_exit:`Ausgang`,icon_exit_access:`Stufenloser Ausgang`,icon_wc:`WC`,icon_escalator:`Rolltreppe`,icon_elevator:`Aufzug`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_door_open:`Offene Tür`,icon_mdi_stairs:`Treppe`},editor:{accessibility_only:`Nur barrierefreie Abfahrten anzeigen`,accessibility_only_requires:`Braucht „Rollstuhl-Plakette anzeigen“.`,chips:`Zusätzliche Beschriftungen`,date_format:`Datumsformat`,exit:`Ausgangssymbol`,extra_icons:`Zusätzliche Symbole`,header_exit_accessible:`Stufenloser Ausgang`,header_exit_none:`Kein`,header_exit_regular:`Ausgang`,hide_attribution:`Datenquelle ausblenden`,hide_attribution_helper:`Wenn aktiv, wird die CC-BY-Quellenangabe am unteren Rand der Karte ausgeblendet. Die OGD-Lizenz der Wiener Linien verlangt eine sichtbare Quellenangabe, sofern der Hinweis nicht an anderer Stelle im Dashboard erscheint.`,housing:`Gehäuserahmen anzeigen`,housing_helper:`Umrahmt die Tafel mit dem Gehäuse inkl. dezenter Innenkante und Schlagschatten. Gehäusefarbe folgt dem HA-Theme (cremefarben im Hellmodus, dunkel im Dunkelmodus). Aus = Tafel sitzt bündig auf dem Dashboard.`,icon_mdi_door_open:`Offene Tür`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_stairs:`Treppe`,max_rows:`Anzahl Zeilen`,max_rows_helper:`Wie viele Abfahrten die Tafel zeigt (1–8). Über alle Haltestellen zusammengeführt, nach Abfahrtszeit sortiert.`,show_accessibility:`Rollstuhl-Plakette anzeigen`,show_accessibility_helper:`Zeigt eine Rollstuhl-Plakette neben barrierefreien Abfahrten.`,show_clock:`Uhr-Plakette anzeigen`,show_date:`Datums-Plakette anzeigen`,show_header:`Stationsanzeige anzeigen`,show_header_helper:`Hauptschalter. Einstellungen pro Seite bleiben gespeichert.`,show_line_column:`Linienspalte anzeigen`,show_line_column_helper:`Zeigt die Spalte mit dem Liniencode. Ausschalten, wenn die Tafel ohnehin nur eine Linie zeigt.`,show_min_unit:`Einheit „min“ anzeigen`,show_min_unit_helper:`Kleines „min“ neben der Minutenzahl, wie auf echten Stationstafeln.`,show_platform:`Gleis/Steig anzeigen`,show_platform_helper:`Fügt jeder Zeile eine eigene Gleis-Plakette zwischen Ziel und Minutenzahl hinzu. Wird nur eingeblendet, wenn mindestens eine sichtbare Zeile einen Gleis-Wert hat.`,show_station_name:`Stationsnamen anzeigen`,show_station_name_helper:`Farbiges Band mit Stationsname und Uhrzeit am oberen Rand der Karte.`,size:`Größe`,station_bg:`Hintergrund Stationsschild`,station_bg_black:`Schwarz`,station_bg_helper:`Standard ist die Farbe der ersten erfassten Linie (z. B. Rot für U1, Orange für U3). Bei mehreren Linien kann eine bestimmte Linie gewählt oder auf Weiß bzw. Schwarz umgestellt werden.`,station_bg_line:`Erste Linie`,station_bg_white:`Weiß`,text:`Beschriftung`}},qe={common:Ue,modern:We,retro:Ge,flap:Ke},Je=t({common:()=>Ye,default:()=>$e,flap:()=>Qe,modern:()=>Xe,retro:()=>Ze}),Ye={editor:{add_chip:`Add chip`,add_icon:`Add icon`,date_format_placeholder:`d.m.Y`,direction_label:`Direction`,direction_not_served:`not served`,direction_note_one_way:`Return direction disabled: {line} terminates here.`,direction_unavailable:`No departures in this direction`,entities:`Stops`,entity:`Stop`,header_amenities:`Icons in this slot`,header_bar_aria:`Station sign — choose a side`,header_chips_and_icons:`Text chips (max. {chips}) and extra icons (max. {icons})`,header_left:`Left side`,header_pick_side_hint:`Tap a side, then fill it in below`,header_right:`Right side`,header_side_aria:`Station sign side`,header_slot_empty:`empty`,line_active_aria:`Line {line} active`,line_inactive_aria:`Line {line} inactive`,lines_empty_means_all:`empty = all lines`,lines_label:`Lines at this stop`,lines_selected:`{n} of {total}`,no_lines_hint:`Lines appear as soon as this stop reports departures.`,no_lines_title:`No lines yet`,per_line_direction_aria:`Line {line}: {direction}`,remove_chip_aria:`Remove chip {chip}`,remove_icon_aria:`Remove icon {icon}`,remove_stop:`Remove stop`,section_board:`Split-flap board`,section_departure_row:`Departure row`,section_extras:`Extras`,section_extras_hint:`optional`,section_footer:`Footer`,section_header:`Station sign`,section_header_hint:`Edit on the bar`,section_led_panel:`LED panel`,section_station:`Station band`,section_walk_time:`Walking time to the stop`,show_clock_short:`Clock`,show_date_short:`Date`,show_elevator_short:`Elevator`,show_escalator_short:`Escalator`,show_wc_short:`WC`,size_medium:`Medium`,size_regular:`Standard`,size_small:`Small`,tab_display:`Display`,tab_stop:`Stop`,tab_stops:`Stops`,tab_tweaks:`Style`,text_placeholder:`e.g. name of the next station`,walk_time_aria:`Walking time in minutes for line {line} towards {towards}`,walk_time_branching_hint:`Applies to every terminus in this direction`,walk_time_hint:`Hides departures that would leave without you. Empty = no filter.`,walk_time_less_aria:`Decrease walking time for line {line}`,walk_time_more_aria:`Increase walking time for line {line}`,walk_time_placeholder:`–`,walk_time_unit:`minutes`}},Xe={no_data:`No departures available`,betriebsschluss:`End of service`,stale_feed:`No live data`,stale_feed_detail:`Wiener Linien is sending out-of-date departure times for this stop. Departures return automatically once live data resumes.`,stale_feed_since:`Last reported departure: {time}`,stale_feed_partial:`Some lines aren't reporting current times.`,min:`min`,now:`Now`,platform_short_rail:`Track`,platform_short_bus:`Bay`,version_update:`Wiener Linien Austria updated to v{v} — please reload`,version_reload:`Reload`,version_reload_stuck:`Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.`,entity_missing:`Sensor {entity} no longer exists. Pick a different sensor, or remove it from this card's stops.`,no_entities_picked:`No stop selected`,no_entities_available:`No Wiener Linien sensors found`,departures_list:`Upcoming departures`,barrier_free_title:`Step-free access`,cooling_title:`Air conditioned`,disturbance_title:`Traffic disruption reported`,stops_ahead_aria_show:`Show stops ahead for {line} towards {towards}`,stops_ahead_aria_hide:`Hide stops ahead for {line} towards {towards}`,stops_ahead_other_show:`Show {count} more lines at {stop}`,stops_ahead_other_hide:`Hide other lines at {stop}`,dir_h:`Outbound`,dir_r:`Return`,dir_h_short:`H`,dir_r_short:`R`,dir_both:`Both`,traffic_label:`Disruption`,traffic_until:`Until`,traffic_updated:`updated`,elevator_until:`Until`,open_in_maps:`Open in maps`,qr_open:`Show QR code`,qr_dialog_title:`QR code for stop`,qr_dialog_hint:`Scan with your phone — opens the stop in your maps app.`,qr_dialog_close:`Close QR code`,delay_singular:`1 min. late`,delay_plural:`{n} min. late`,devmode_title:`DEV`,devmode_traffic_btn:`Test disruption`,devmode_elevator_btn:`Test elevator`,devmode_colors_btn:`Line colours`,devmode_clear_btn:`Clear`,editor:{accessibility_only:`Only show step-free departures`,accessibility_only_requires:`Requires “Show accessibility icon”.`,colors_empty_hint:`Pick stops on the Stops tab — their lines will show up here.`,colors_hint:`Optional. Without an override the official line colour applies.`,hide_attribution:`Hide data source`,hide_attribution_helper:`When on, the data-source credit is hidden.`,hide_header:`Hide header`,hide_header_helper:`When on, the card title bar is hidden.`,layout:`Multi-stop layout`,layout_requires:`Only takes effect with two or more stops.`,layout_stacked:`Stacked`,layout_tabs:`Tabs`,max_departures:`Departures per stop`,pick_color_for_line:`Pick colour for line {line}`,reset_color:`Reset to default`,reset_color_aria:`Reset line colour {line} to default`,section_colors:`Line colours`,section_colors_hint:`overrides the API colour`,section_departure_row_hint:`per row`,section_disruptions:`Disruptions & delays`,section_layout:`Structure`,section_layout_hint:`Layout`,show_accessibility:`Show step-free icon`,show_cooling:`Show air-conditioning icon`,show_cooling_helper:`Shows a snowflake beside departures with an air-conditioned vehicle. Wiener Linien report this per vehicle — older trains and trams don't send it.`,show_delay:`Show delays`,show_delay_colors:`Colour-code delays`,show_delay_colors_helper:`Turns the countdown number red when a departure runs late and green when it runs early.`,show_delay_colors_requires:`Requires “Show delays”.`,show_departures:`Show departure list`,show_elevator_info:`Show elevator outages`,show_hero_metric:`Show next departure large`,show_platform:`Show platform / track`,show_qr_button:`Show QR-code button`,show_stops_ahead:`Show intermediate stops`,show_traffic_info:`Show disruption alerts`,show_type_icon:`Show vehicle-type icon`}},Ze={editor:{accessibility_only:`Only show step-free departures`,chips:`Extra labels`,date_format:`Date format`,exit:`Exit icon`,extra_icons:`Extra icons`,flicker:`Simulate LED flicker`,header_exit_accessible:`Step-free exit`,header_exit_none:`None`,header_exit_regular:`Exit`,housing:`Show LED cabinet frame`,housing_helper:`Dark bezel around the LED panel with a subtle glass reflection on top.`,icon_mdi_door_open:`Open door`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_stairs:`Stairs`,line_stripe:`Show line stripe`,line_stripe_helper:`A 4 px coloured bar at the left edge of each row, matched to the line.`,message_text:`Message`,message_text_requires:`Requires “Show ticker”.`,message_ticker:`Scrolling message`,message_ticker_helper:`Runs a custom message across the display every 5 minutes.`,platform_side:`Platform side`,platform_side_auto:`Auto (1 = right, 2 = left)`,platform_side_helper:`Default follows Wiener Linien signage (platform 2 on the left, otherwise right). Override manually if needed.`,platform_side_left:`Always left`,platform_side_requires:`Requires “Show platform”.`,platform_side_right:`Always right`,show_clock:`Show clock chip`,show_date:`Show date chip`,show_header:`Show station sign`,show_header_helper:`Master switch. Per-side settings are kept.`,show_line_pill:`Show line badge`,show_line_pill_helper:`Renders the line code as a filled badge in the line colour rather than plain text.`,show_platform:`Show platform`,show_station_name:`Show station name`,show_unit:`Show the “min” unit`,show_unit_helper:`Trail each countdown number with a small amber "min" caption.`,size:`Size`,station_bg:`Station-name background`,station_bg_black:`Black`,station_bg_default:`Default`,station_bg_white:`White`,style:`Style`,style_classic:`Classic`,style_pixel:`Dot matrix`,style_warm:`Warm`,text:`Sign text`,wheelchair_race:`Wheelchair race (easter egg)`},aria_dismiss_message:`Dismiss scrolling message`,aria_start_race:`Start accessibility race`,at_platform:`Arriving`,barrier_free_title:`Step-free access`,betriebsschluss:`End of service`,countdown_minutes:`{n} minutes`,departures_list:`Upcoming departures`,dir_both:`Both`,dir_h:`Outbound`,dir_h_short:`H`,dir_r:`Return`,dir_r_short:`R`,entity_missing:`Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.`,gleis:`PLATF.`,header:{icon_exit:`Exit`,icon_exit_access:`Step-free exit`,icon_wc:`Toilet`,icon_escalator:`Escalator`,icon_elevator:`Elevator`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_door_open:`Open door`,icon_mdi_stairs:`Stairs`},no_data:`No departures`,no_data_wrong_direction:`No departures in this direction`,no_data_wrong_line:`No departures for this line`,no_entity:`No stop selected`,race_finished:`Accessibility race finished`,race_starting_in:`Race starting in {n}`,race_winner_announce:`Wheelchair {n} wins the accessibility race`,stale_feed:`No live data`,steig:`BAY`,unit_min:`min`,version_reload:`Reload`,version_reload_stuck:`Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.`,version_update:`Retro card updated to v{v} — please reload`,via_prefix:`VIA`},Qe={no_entity:`No stop selected`,no_data:`No departures`,no_data_wrong_direction:`No departures in this direction`,no_data_wrong_line:`No departures for this line`,betriebsschluss:`End of service`,stale_feed:`No live data`,dir_h:`Outbound`,dir_r:`Return`,dir_h_short:`H`,dir_r_short:`R`,gleis:`PLATF.`,steig:`BAY`,col_line:`LINE`,col_dest:`DIRECTION`,col_step_free:`STEP-FREE`,col_cd:`ARRIVAL`,version_update:`Flap card updated to v{v} — please reload`,version_reload:`Reload`,version_reload_stuck:`Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.`,entity_missing:`Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.`,departures_list:`Upcoming departures`,at_platform:`Arriving`,countdown_minutes:`{n} minutes`,barrier_free_title:`Step-free access`,not_barrier_free_title:`Step-free access not available`,unit_min:`min`,dir_both:`Both`,header:{icon_exit:`Exit`,icon_exit_access:`Step-free exit`,icon_wc:`Toilet`,icon_escalator:`Escalator`,icon_elevator:`Elevator`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_door_open:`Open door`,icon_mdi_stairs:`Stairs`},editor:{accessibility_only:`Only show step-free departures`,accessibility_only_requires:`Requires “Show wheelchair badge”.`,chips:`Extra labels`,date_format:`Date format`,exit:`Exit icon`,extra_icons:`Extra icons`,header_exit_accessible:`Step-free exit`,header_exit_none:`None`,header_exit_regular:`Exit`,hide_attribution:`Hide data source`,hide_attribution_helper:`When on, the CC-BY credit at the bottom of the card is hidden. The Wiener Linien Open Government Data licence requires visible attribution unless you keep the credit elsewhere on the dashboard.`,housing:`Show cabinet frame`,housing_helper:`Wraps the board in the cabinet with a soft inset bevel and drop shadow. Cabinet colour follows your HA theme (cream on light, dark on dark). When off, the board sits flush against the dashboard.`,icon_mdi_door_open:`Open door`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_stairs:`Stairs`,max_rows:`Number of rows`,max_rows_helper:`How many departures to show on the board (1–8). Merged across all stops, sorted by countdown.`,show_accessibility:`Show step-free tile`,show_accessibility_helper:`Add a wheelchair pictogram tile next to step-free departures.`,show_clock:`Show clock chip`,show_date:`Show date chip`,show_header:`Show station sign`,show_header_helper:`Master switch. Per-side settings are kept.`,show_line_column:`Show line column`,show_line_column_helper:`Shows the column carrying the line code. Turn it off when the board only ever shows one line.`,show_min_unit:`Show "min" caption`,show_min_unit_helper:`Small label next to the countdown number, like real station boards.`,show_platform:`Show platform / track`,show_platform_helper:`Adds a per-row platform tile between the destination and the countdown. Only shown when at least one visible row has a platform value.`,show_station_name:`Show station name`,show_station_name_helper:`Coloured band with the station name and current time at the top of the card.`,size:`Size`,station_bg:`Station-name background`,station_bg_black:`Black`,station_bg_helper:`Default is the colour of the first tracked line (e.g. red for U1, orange for U3). On multi-line boards you can pick a specific line, or override with solid white or black.`,station_bg_line:`First line`,station_bg_white:`White`,text:`Sign text`}},$e={common:Ye,modern:Xe,retro:Ze,flap:Qe};const et={de:He,en:Je},tt=et.de??{};function nt(e,t){return e.split(`.`).reduce((e,t)=>{if(e&&typeof e==`object`&&t in e)return e[t]},t)}function rt(e,t){let n=nt(e,t);return typeof n==`string`?n:void 0}function it(e){return((e.configLanguage||e.hassLanguage||`de`).split(/[-_]/)[0]??`de`)===`en`?`en`:`de`}function at(e,t,n){let r=it(t),i=rt(e,et[r]??tt);if(i===void 0&&(i=rt(e,tt)),i===void 0)return e;if(n)for(let[e,t]of Object.entries(n))i=i.replace(`{${e}}`,String(t));return i}async function ot(e,t,n){if(!e?.callWS)return null;try{let r=await e.callWS({type:t});if(r?.version&&r.version!==n)return r.version}catch{}return null}function st(e){try{window.caches?.keys?.().then(e=>{e.forEach(e=>window.caches?.delete?.(e))})}catch{}if(e)try{window.sessionStorage?.setItem(`wl-reload-attempted-${e}`,`1`)}catch{}window.location.reload()}function ct(e){if(!e)return!1;try{return window.sessionStorage?.getItem(`wl-reload-attempted-${e}`)===`1`}catch{return!1}}function lt(e,t,n=`banner`){if(!e)return I;if(ct(e)){let e=t(`version_reload_stuck`);return P`
      <div class=${n} role="alert" aria-live="assertive">
        <span>${e}</span>
      </div>
    `}let r=t(`version_update`).replace(`{v}`,e),i=t(`version_reload`);return P`
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
  `}function ut(e){return typeof e==`string`&&/^https?:\/\//i.test(e)?e:``}function W(e,t){return e?P`<span lang="de">${e}</span>`:t??``}function dt(e,t,n){e.dispatchEvent(new CustomEvent(t,{detail:n,bubbles:!0,composed:!0}))}function ft(e){switch(e){case`ptMetro`:return`mdi:subway-variant`;case`ptTram`:return`mdi:tram`;case`ptBusCity`:case`ptBusNight`:return`mdi:bus`;default:return null}}function pt(e){return ft(e)??`mdi:bus-stop`}function mt(e){if(e?.themes?.darkMode===!0)return`dark`;if(e?.themes?.darkMode===!1)return`light`}const G=e=>Math.min(1,Math.max(0,e)),K=e=>e<=.04045?e/12.92:((e+.055)/1.055)**2.4,ht=e=>e<=.0031308?e*12.92:1.055*e**(1/2.4)-.055;function gt(e){let t=e.trim();if(!t||t.includes(`var(`))return null;let n=/^#[0-9a-f]{3,8}$/i.test(t)?t.slice(1):``;if(!n){let e=``;try{let n=document.createElement(`span`).style;n.color=t,e=n.color.trim()}catch{return null}let n=/^rgba?\(([^)]+)\)$/.exec(e);if(!n?.[1])return null;let[r,i,a]=n[1].split(/[,\s/]+/).filter(Boolean).map(Number);return r===void 0||i===void 0||a===void 0||![r,i,a].every(Number.isFinite)?null:[K(r/255),K(i/255),K(a/255)]}if((n.length===3||n.length===4)&&(n=[...n.slice(0,3)].map(e=>e+e).join(``)),n.length!==6&&n.length!==8)return null;let r=Number.parseInt(n.slice(0,6),16);return Number.isFinite(r)?[K((r>>16&255)/255),K((r>>8&255)/255),K((r&255)/255)]:null}function _t([e,t,n]){let r=Math.cbrt(.4122214708*e+.5363325363*t+.0514459929*n),i=Math.cbrt(.2119034982*e+.6806995451*t+.1073969566*n),a=Math.cbrt(.0883024619*e+.2817188376*t+.6299787005*n);return[.2104542553*r+.793617785*i-.0040720468*a,1.9779984951*r-2.428592205*i+.4505937099*a,.0259040371*r+.7827717662*i-.808675766*a]}function vt([e,t,n]){let r=(e+.3963377774*t+.2158037573*n)**3,i=(e-.1055613458*t-.0638541728*n)**3,a=(e-.0894841775*t-1.291485548*n)**3;return[4.0767416621*r-3.3077115913*i+.2309699292*a,-1.2684380046*r+2.6097574011*i-.3413193965*a,-.0041960863*r-.7034186147*i+1.707614701*a]}const yt=([e,t,n])=>`#`+[e,t,n].map(e=>Math.round(G(ht(e))*255).toString(16).padStart(2,`0`)).join(``),bt=([e,t,n])=>.2126*e+.7152*t+.0722*n;function xt(e,t){let n=gt(e),r=gt(t);if(!n||!r)return null;let i=bt(n),a=bt(r);return(Math.max(i,a)+.05)/(Math.min(i,a)+.05)}function St(e,t,n){let r=gt(e),i=gt(t);return!r||!i?null:`#`+[0,1,2].map(e=>G(ht(r[e])*n+ht(i[e])*(1-n))).map(e=>Math.round(e*255).toString(16).padStart(2,`0`)).join(``)}function Ct(e,t){if(t===void 0)return null;let n=gt(e);if(!n)return null;let[r,i,a]=_t(n),o=t===`dark`?Math.max(.72,r):Math.min(.45,r);if(o===r)return yt(n);let s=Math.hypot(i,a),c=Math.atan2(a,i),l=vt([o,s*Math.cos(c),s*Math.sin(c)]);return yt([G(l[0]),G(l[1]),G(l[2])])}const wt={LB:`WLB`,"25BR":`25B`};function Tt(e){return wt[e]??e}const Et=[`mdi:exit-run`,`mdi:exit-to-app`,`mdi:door-open`,`mdi:stairs`];function q(e,t){return typeof e==`boolean`?e:t}[...Et];function Dt(e,t){let n={};if(!e||typeof e!=`object`)return n;for(let[r,i]of Object.entries(e))t.has(r)||(n[r]=i);return n}function Ot(e){if(!e||typeof e!=`object`)return;let t={};for(let[n,r]of Object.entries(e)){let e=typeof r==`number`?r:typeof r==`string`?Number(r):NaN;if(!Number.isFinite(e)||e<0||e>120){console.warn(`[wiener-linien-austria] walk_times["${n}"] = ${JSON.stringify(r)} is not a finite number in 0..120 — dropping`);continue}let i=n.split(`|`),a=i.length>=3?`${i[0]}|${i[1]}`:n,o=Math.round(e),s=t[a];t[a]=s===void 0?o:Math.max(s,o)}return Object.keys(t).length?t:void 0}function kt(e){if(!e||typeof e!=`object`)return;let t={};for(let[n,r]of Object.entries(e)){if(typeof n!=`string`||!n.length)continue;let e=n.toUpperCase();if(r===`H`||r===`R`){t[e]=r;continue}r!==void 0&&r!==``&&r!==`Both`&&console.warn(`[wiener-linien-austria] line_directions["${n}"] = ${JSON.stringify(r)} is not "H" / "R" / "Both" — dropping`)}return Object.keys(t).length?t:void 0}function At(e){if(typeof e==`string`)return e.startsWith(`sensor.`)?{entity:e}:(console.warn(`[wiener-linien-austria] entities[] entry ${JSON.stringify(e)} is not a sensor.* entity — dropping`),null);if(!e||typeof e!=`object`)return console.warn(`[wiener-linien-austria] entities[] entry ${JSON.stringify(e)} is not a string or object — dropping`),null;let t=e,n=typeof t.entity==`string`?t.entity:null;if(!n?.startsWith(`sensor.`))return console.warn(`[wiener-linien-austria] entities[] entry has missing or non-sensor.* entity field`,e),null;let r={entity:n};if(Array.isArray(t.lines)){let e=t.lines.filter(e=>typeof e==`string`&&e.length>0).map(Tt);e.length&&(r.lines=e)}(t.direction===`H`||t.direction===`R`)&&(r.direction=t.direction);let i=kt(t.line_directions);i&&(r.line_directions=i);let a=Ot(t.walk_times);return a&&(r.walk_times=a),r}const jt=new Set([`type`,`entities`,`entity`,`lines`,`direction`,`walk_times`,`max_departures`,`line_colors`,`show_accessibility`,`accessibility_only`,`show_cooling`,`show_traffic_info`,`show_elevator_info`,`show_delay`,`show_delay_colors`,`show_type_icon`,`show_platform`,`show_hero_metric`,`show_departures`,`show_stops_ahead`,`show_qr_button`,`hide_header`,`hide_attribution`,`layout`]),J={max_departures:6,show_accessibility:!1,accessibility_only:!1,show_cooling:!1,show_traffic_info:!0,show_elevator_info:!0,show_delay:!0,show_delay_colors:!0,show_type_icon:!1,show_platform:!0,show_hero_metric:!0,show_departures:!0,show_stops_ahead:!0,show_qr_button:!0,hide_header:!1,hide_attribution:!1,layout:`stacked`};function Mt(e){let t=[];Array.isArray(e.entities)?t=e.entities:typeof e.entity==`string`&&(t=[{entity:e.entity,lines:e.lines,direction:e.direction,walk_times:e.walk_times}]);let n=[],r=new Set;for(let e of t){let t=At(e);t&&(r.has(t.entity)||(r.add(t.entity),n.push(t)))}let i=Number(e.max_departures),a=Number.isFinite(i)?Math.max(0,Math.min(20,Math.round(i))):J.max_departures,o={};if(e.line_colors&&typeof e.line_colors==`object`){let t=/^#(?:[0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;for(let[n,r]of Object.entries(e.line_colors))typeof r==`string`&&t.test(r.trim())&&(o[n.toUpperCase()]=r.trim())}return{...Dt(e,jt),type:typeof e.type==`string`&&e.type?e.type:`custom:wiener-linien-austria-card`,entities:n,max_departures:a,line_colors:o,show_accessibility:q(e.show_accessibility,J.show_accessibility),accessibility_only:q(e.accessibility_only,J.accessibility_only),show_cooling:q(e.show_cooling,J.show_cooling),show_traffic_info:q(e.show_traffic_info,J.show_traffic_info),show_elevator_info:q(e.show_elevator_info,J.show_elevator_info),show_delay:q(e.show_delay,J.show_delay),show_delay_colors:q(e.show_delay_colors,J.show_delay_colors),show_type_icon:q(e.show_type_icon,J.show_type_icon),show_platform:q(e.show_platform,J.show_platform),show_hero_metric:q(e.show_hero_metric,J.show_hero_metric),show_departures:q(e.show_departures,J.show_departures),show_stops_ahead:q(e.show_stops_ahead,J.show_stops_ahead),show_qr_button:q(e.show_qr_button,J.show_qr_button),hide_header:q(e.hide_header,J.hide_header),hide_attribution:q(e.hide_attribution,J.hide_attribution),layout:e.layout===`tabs`?`tabs`:`stacked`}}function Y(e,t,n={},r=`var(--primary-color)`){let i=e.toUpperCase();if(t[i]!==void 0)return{background:t[i]};if(/^N\d/.test(i))return{background:Ve,color:`#fef200`};let a=n[e]??n[i];return a?.bg?a.fg?{background:`#${a.bg}`,color:`#${a.fg}`}:{background:`#${a.bg}`}:{background:r}}function Nt(e,t,n={},r=`var(--primary-color)`){return Y(e,t,n,r).background}function Pt(e,t,n={},r,i=`var(--primary-color)`){let a=Y(e,t,n,i);return{fill:a.background,ink:a.color,text:Ct(a.background,r)??void 0}}function Ft(e){if(!e)return[];let t=[];for(let[n,r]of Object.entries(e.states??{})){if(!n.startsWith(`sensor.`))continue;let e=r?.attributes??{};typeof e.diva==`number`&&Array.isArray(e.departures)&&e.next_by_line&&typeof e.next_by_line==`object`&&t.push(n)}return t.sort(),t}function It(e,t){return!e||!t?{}:e.states?.[t]?.attributes?.line_colors??{}}function Lt(e,t){if(!e)return{};let n={};for(let r of t)for(let[t,i]of Object.entries(It(e,r)))t in n||(n[t]=i);return n}function Rt(e,t){return`${e}|${t}`}function zt(e){let t=[],n=new Set;for(let r of e?.departures??[]){let e=String(r.direction??``),i=`${r.line}|${e}|${r.towards}`;n.has(i)||(n.add(i),t.push({line:r.line,direction:e,towards:r.towards,type:r.type}))}return t.sort((e,t)=>e.line===t.line?e.towards.localeCompare(t.towards):e.line.localeCompare(t.line)),t}function Bt(e){let t=new Map;for(let n of e?.departures??[]){let e=String(n.direction??``),r=Rt(n.line,e),i=t.get(r);i||(i={line:n.line,direction:e,type:n.type,termini:[]},t.set(r,i)),n.towards&&!i.termini.includes(n.towards)&&i.termini.push(n.towards)}let n=Array.from(t.values());return n.sort((e,t)=>e.line===t.line?e.direction.localeCompare(t.direction):e.line.localeCompare(t.line)),n}function Vt(e,t){if(!e.length)return t.full;let n=e.slice(0,3).join(` / `),r=e.length>3?` +${e.length-3}`:``;return`${t.short}: ${n}${r}`}function Ht(e,t){let n=new Set;for(let r of e?.tracked_line_keys??[]){let[e,i]=r.split(`|`,2);t&&e!==t||(i===`H`||i===`R`)&&n.add(i)}if(n.size===0)for(let r of e?.departures??[])t&&r.line!==t||(r.direction===`H`||r.direction===`R`)&&n.add(r.direction);let r=[...n];return{available:n,unknown:n.size===0,oneWay:n.size===1?r[0]??null:null}}function Ut(e,t){if(t.size===0)return[...e];let n=e.filter(e=>t.has(e));for(let e of t)n.includes(e)||n.push(e);return n}function Wt(e){if(e?.tracked_lines?.length)return[...e.tracked_lines].sort();let t=new Set;if(e?.lines_at_stop?.length)for(let n of e.lines_at_stop)t.add(n);for(let n of e?.departures??[])n.line&&t.add(n.line);return Array.from(t).sort()}function Gt(e,t){let n=new Set;for(let r of t){let t=e?.states?.[r]?.attributes;for(let e of Wt(t))n.add(e)}return Array.from(n).sort()}function Kt(e,t){let{lines:n,direction:r,line_directions:i,walk_times:a,accessibility_only:o}=t,s=n&&n.length?new Set(n.map(Tt)):null;return e.filter(e=>{if(s&&!s.has(e.line))return!1;let t=i?.[e.line]??r;if(t&&e.direction!==t)return!1;if(a){let t=a[Rt(e.line,String(e.direction??``))];if(typeof t==`number`&&e.countdown<t)return!1}return!(o&&!e.barrier_free)})}function qt(e,t){return e!==!1&&Array.isArray(t.stops_ahead)&&t.stops_ahead.length>0}function Jt(e,t){let{lines:n,picked:r,lineDirections:i,stopDirection:a}=t,o=e=>i[e]??a,s=Bt(e).filter(e=>{if(r.size>0&&!r.has(e.line))return!1;let t=o(e.line);return!t||e.direction===t}),c=new Set(s.map(e=>e.line)),l=Ut(n,r),u=[];for(let e of l){if(c.has(e))continue;let t=o(e);for(let n of t?[t]:[`H`,`R`])u.push({line:e,direction:n,type:``,termini:[]})}return[...s,...u].sort((e,t)=>e.line===t.line?e.direction.localeCompare(t.direction):e.line.localeCompare(t.line))}function Yt(e){return e.replace(/[^A-Za-z0-9_]/g,`_`)}function Xt(e,t){let n=new Set(e);return n.has(t)?n.delete(t):n.add(t),n}const Zt=[`Voraussichtliche Dauer`,`Grund`],Qt=/^(Linien?\s+[^:]{1,60}):\s*/,$t=RegExp(`${Qt.source}$`),en=RegExp(`^(${Zt.join(`|`)}):\\s*(.+)$`),tn=RegExp(`(?<=\\S)\\s*(?=(?:${Zt.join(`|`)}):)`,`g`),nn=[[RegExp(`^Die\\s+(?:${[`Störung`,`Sperre`,`Umleitung`,`Unterbrechung`,`Behinderung`].join(`|`)})\\s+dauert\\s+voraussichtlich\\s+bis\\s+(.+)$`,`i`),`Voraussichtliche Dauer`],[/^Grund\s+(?:dafür|hierfür)\s+(?:ist|sind)\s+(?:eine?\s+)?(.+)$/i,`Grund`]];function rn(e){for(let[t,n]of nn){let r=t.exec(e);if(r?.[1])return{label:n,value:r[1]}}return null}const an=`mdi:information-outline`,on=[[/bauarbeit|baustelle|gleisbau|bauma(ß|ss)nahme/i,`mdi:excavator`],[/verkehrsunfall|unfall|kollision|zusammensto(ß|ss)/i,`mdi:car-emergency`],[/rettung|sanit(ä|ae)|notarzt/i,`mdi:ambulance`],[/feuerwehr|brand/i,`mdi:fire-truck`],[/polizei/i,`mdi:police-badge`],[/demonstration|kundgebung|veranstaltung|umzug|marathon/i,`mdi:account-group`],[/schnee|\beis|vereis|\bglatt|gl(ä|ae)tte/i,`mdi:snowflake`],[/sturm|unwetter|witterung|gewitter|hitze/i,`mdi:weather-lightning-rainy`],[/gebrechen|defekt|schaden|st(ö|oe)rung|reparatur|erneuerung|instandsetzung|ma(ß|ss)nahme|wartung/i,`mdi:wrench`]];function sn(e){for(let[t,n]of on)if(t.test(e))return n;return an}function cn(e){return e.split(/\s+-\s+/).map(e=>e.trim().replace(/\.$/,``)).filter(Boolean)}const ln=/^\d{1,2}[:.]\d{2}(\s*Uhr)?\.?$/i;function un(e){let t=e.trim();return!t.endsWith(`.`)||/^\d+\.$/.test(t)?t:t.slice(0,-1)}function dn(e,t){if(e===`Grund`){for(let[e,n]of on)if(e.test(t))return n;return an}return e===`Voraussichtliche Dauer`?ln.test(t.trim())?`mdi:clock-outline`:`mdi:calendar-clock`:an}const fn=new Set([`P`,`DIV`,`LI`,`UL`,`OL`,`TR`,`H1`,`H2`,`H3`,`H4`,`H5`,`H6`]),pn=new Set([`SCRIPT`,`STYLE`,`TEMPLATE`,`IFRAME`,`SVG`,`NOSCRIPT`]);function mn(e){let t=new DOMParser().parseFromString(e,`text/html`),n=[],r=``,i=()=>{let e=r.replace(/\s+/g,` `).trim();e&&n.push(e),r=``},a=e=>{let t=e.split(/\r?\n/);r+=t[0]??``;for(let e=1;e<t.length;e+=1)i(),r+=t[e]??``},o=e=>{let t=e.childNodes;for(let e=0;e<t.length;e+=1){let n=t[e];if(!n)continue;if(n.nodeType===Node.TEXT_NODE){a(n.nodeValue??``);continue}if(n.nodeType!==Node.ELEMENT_NODE)continue;let r=n.tagName.toUpperCase();if(!pn.has(r)){if(r===`BR`){i();continue}o(n),fn.has(r)&&i()}}};return o(t.body),i(),n}function hn(e){let t=[],n=e,r=Qt.exec(n);r&&(t.push(`${r[1]}:`),n=n.slice(r[0].length));for(let e of n.split(tn)){let n=e.trim();n&&t.push(n)}return t}function gn(e){let t=[],n=[],r=new Set;for(let i of mn(String(e??``)))for(let e of hn(i)){let i=en.exec(e);if(i?.[1]&&i[2]){if(r.has(i[1]))continue;r.add(i[1]);let e=un(i[2]);n.push({label:i[1],value:e,icon:dn(i[1],e)});continue}let a=rn(e);if(a&&!r.has(a.label)){r.add(a.label);let e=un(a.value);n.push({label:a.label,value:e,icon:dn(a.label,e)});continue}let o=$t.exec(e);if(o?.[1]){t.push({kind:`heading`,text:o[1]});continue}t.push({kind:`para`,text:e})}return{blocks:t,facts:n}}function _n(e){switch(e){case`mdi:subway-variant`:return`M18,11H13V6H18M16.5,17A1.5,1.5 0 0,1 15,15.5A1.5,1.5 0 0,1 16.5,14A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 16.5,17M11,11H6V6H11M7.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,14A1.5,1.5 0 0,1 9,15.5A1.5,1.5 0 0,1 7.5,17M12,2C7.58,2 4,2.5 4,6V15.5A3.5,3.5 0 0,0 7.5,19L6,20.5V21H18V20.5L16.5,19A3.5,3.5 0 0,0 20,15.5V6C20,2.5 16.42,2 12,2Z`;case`mdi:tram`:return`M19,16.94V8.5C19,5.71 16.39,5.1 13,5L13.75,3.5H17V2H7V3.5H11.75L11,5C7.86,5.11 5,5.73 5,8.5V16.94C5,18.39 6.19,19.6 7.59,19.91L6,21.5V22H8.23L10.23,20H14L16,22H18V21.5L16.5,20H16.42C18.11,20 19,18.63 19,16.94M12,18.5A1.5,1.5 0 0,1 10.5,17A1.5,1.5 0 0,1 12,15.5A1.5,1.5 0 0,1 13.5,17A1.5,1.5 0 0,1 12,18.5M17,14H7V9H17V14Z`;case`mdi:bus`:return`M18,11H6V6H18M16.5,17A1.5,1.5 0 0,1 15,15.5A1.5,1.5 0 0,1 16.5,14A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 16.5,17M7.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,14A1.5,1.5 0 0,1 9,15.5A1.5,1.5 0 0,1 7.5,17M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16Z`;default:return`M22 7V16C22 16.71 21.62 17.36 21 17.72V19.25C21 19.66 20.66 20 20.25 20H19.75C19.34 20 19 19.66 19 19.25V18H12V19.25C12 19.66 11.66 20 11.25 20H10.75C10.34 20 10 19.66 10 19.25V17.72C9.39 17.36 9 16.71 9 16V7C9 4 12 4 15.5 4S22 4 22 7M13 15C13 14.45 12.55 14 12 14S11 14.45 11 15 11.45 16 12 16 13 15.55 13 15M20 15C20 14.45 19.55 14 19 14S18 14.45 18 15 18.45 16 19 16 20 15.55 20 15M20 7H11V11H20V7M7 9.5C6.97 8.12 5.83 7 4.45 7.05C3.07 7.08 1.97 8.22 2 9.6C2.03 10.77 2.86 11.77 4 12V20H5V12C6.18 11.76 7 10.71 7 9.5Z`}}function vn(e,t){if(!e||!t)return null;let n=Date.parse(e),r=Date.parse(t);return!Number.isFinite(n)||!Number.isFinite(r)?null:Math.round((r-n)/6e4)}function yn(e,t=`de`){if(!e)return``;let n=Date.parse(e);if(!Number.isFinite(n))return e;try{return new Date(n).toLocaleString(t===`en`?`en-GB`:`de-AT`,{hour:`2-digit`,minute:`2-digit`,day:`2-digit`,month:`2-digit`})}catch{return e}}function bn(e,t){let n=Number.isFinite(e.countdown)?e.countdown:null,r=vn(e.time_planned,e.time_real),i=``;n!==null&&n<=0?i=`now`:!t.showDelayColors||r===null?i=``:r>=1?i=`late`:r<=-1&&(i=`early`);let a=!!(e.traffic_jam||t.showAccessibility&&e.barrier_free||t.showCooling&&e.cooling);return{countdown:n,signedDelay:r,cdState:i,hasFlags:a,platform:t.showPlatform&&e.platform?String(e.platform):null}}function xn(e){return Number.isFinite(e.countdown)?e.countdown:1/0}function Sn(e){if(e.length===0)return[];let t=Math.min(...e.map(xn));return Number.isFinite(t)?t<=0?e.filter(e=>xn(e)<=0):e.filter(e=>xn(e)===t):[e[0]]}function Cn(e,t){let n=Sn(e),r=t.showHeroMetric?new Set(n):new Set,i=e.filter(e=>!r.has(e));return{heroGroup:n,heroLead:n[0],rows:i.slice(0,t.maxDepartures)}}const wn=c`:host {
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
}`,Tn=c`:host {
--wl-sunken: color-mix(in srgb, var(--primary-text-color) 3%, var(--card-background-color));
--wl-hover: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
--wl-ripple: color-mix(in srgb, var(--primary-color) 14%, transparent);
}`;function En(e,t){let n={hassLanguage:t};return{t:t=>at(`${e}.${t}`,n),et:t=>{let r=`${e}.editor.${t}`,i=at(r,n);if(i!==r)return i;let a=`common.editor.${t}`,o=at(a,n);return o===a?t:o}}}function Dn(e,t,n){let r=(t,r)=>{let i=t.key===`ArrowRight`?1:t.key===`ArrowLeft`?-1:0;if(!i)return;t.preventDefault();let a=(r+i+e.length)%e.length,o=e[a];if(!o)return;n(o.key);let s=t.currentTarget.parentElement?.children[a];s instanceof HTMLElement&&s.focus()};return P`
    <div class="wl-tabs" role="tablist">
      ${e.map((e,i)=>P`<button
          type="button"
          class="wl-tab"
          role="tab"
          id=${`wl-tab-${e.key}`}
          aria-selected=${t===e.key?`true`:`false`}
          aria-controls=${t===e.key?`wl-panel-${e.key}`:I}
          tabindex=${t===e.key?`0`:`-1`}
          @click=${()=>n(e.key)}
          @keydown=${e=>r(e,i)}
        >
          <span class="wl-tab-label">${e.label}</span>
          <span class="wl-tab-underline" aria-hidden="true"></span>
        </button>`)}
    </div>
  `}function On(e,t){return P`
    <div
      class=${e===`stops`?`wl-panel wl-panel--stops`:`wl-panel`}
      role="tabpanel"
      id=${`wl-panel-${e}`}
      aria-labelledby=${`wl-tab-${e}`}
    >
      ${t}
    </div>
  `}function kn(e,t){return P`
    <section class="wl-section">
      <header class="wl-section-header">
        <span class="wl-section-title">${e.title}</span>
        ${e.hint?P`<span class="wl-section-hint">${e.hint}</span>`:I}
      </header>
      <div class="wl-section-body">${t}</div>
    </section>
  `}function An(e){return kn(e,P`<ha-form
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
*/const{I:jn}=we,Mn=e=>e.strings===void 0,Nn={},Pn=(e,t=Nn)=>e._$AH=t,Fn=Ne(class extends Pe{constructor(e){
/**
* @license
* Copyright 2020 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
if(super(e),e.type!==V.PROPERTY&&e.type!==V.ATTRIBUTE&&e.type!==V.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!Mn(e))throw Error("`live` bindings can only contain a single expression")}render(e){return e}update(e,[t]){if(t===F||t===I)return t;let n=e.element,r=e.name;if(e.type===V.PROPERTY){if(t===n[r])return F}else if(e.type===V.BOOLEAN_ATTRIBUTE){if(!!t===n.hasAttribute(r))return F}else if(e.type===V.ATTRIBUTE&&n.getAttribute(r)===t+``)return F;return Pn(e),t}});function In(e){e.key!==`Escape`&&e.key!==`Tab`&&e.stopPropagation()}function Ln(e,t){let n=e.trim(),r=n===``?NaN:Number(n);return n!==``&&!Number.isFinite(r)&&console.warn(`[wiener-linien-austria] walk-time "${e}" for ${t} is not a number — clearing`),Number.isFinite(r)&&r>0?Math.min(120,Math.round(r)):null}function Rn(e){return{"--wl-chip-color":e.fill,...e.text?{"--wl-chip-text":e.text}:{},...e.ink?{"--wl-chip-ink":e.ink}:{}}}function zn(e){return{background:e.fill,...e.ink?{"--wl-chip-ink":e.ink}:{}}}function Bn(e,t){return e?.states?.[t]?.attributes}function Vn(e,t,n){let r=new Set;for(let i of e)i.direction===t&&(n&&i.line!==n||i.towards&&r.add(i.towards));return[...r].sort()}function Hn(e,t){return!e.singleLine&&Ut(t.lines,t.picked).length>=2}function Un(e,t,n,r){let i=Bn(e,t.entity),a=!i,o=i?.stop_name||t.entity,s=i?.line_colors??{},c=mt(e),l=e=>Pt(e,n.lineColorOverrides,s,c,`#5b6470`),u=new Set(t.lines??[]),d=Wt(i),f=u.size?[...new Set([...d,...u])].sort():d,p=zt(i),m=new Map;for(let e of i?.departures??[])e.line&&e.type&&!m.has(e.line)&&m.set(e.line,e.type);let h=e=>({full:n.t(e===`H`?`dir_h`:`dir_r`),short:n.t(e===`H`?`dir_h_short`:`dir_r_short`)});return P`
    <section class="wl-section">
      <header class="wl-section-header">
        ${n.total>1?P`<span class="wl-index" aria-hidden="true">${n.index}</span>`:I}
        <span class="wl-section-title">${o}</span>
      </header>
      <div class="wl-stop-body">
        ${a?Wn(t,n,r):I}
        ${Gn(t,n,r,{lines:f,picked:u,colorOf:l,typeByLine:m})}
        ${!a&&f.length?Hn(n,{lines:f,picked:u})?qn(t,n,r,{attrs:i,triplets:p,picked:u,lines:f,colorOf:l,dirStrings:h}):Kn(t,n,r,{attrs:i,triplets:p,picked:u,lines:f,dirStrings:h}):I}
        ${a?I:Jn(t,n,r,{attrs:i,picked:u,colorOf:l,lines:f,dirStrings:h})}
      </div>
    </section>
  `}function Wn(e,t,n){return P`
    <ha-alert alert-type="error">
      ${t.t(`entity_missing`).replace(`{entity}`,e.entity)}
      ${n.remove?P`<button
            type="button"
            slot="action"
            class="wl-add"
            @click=${()=>n.remove?.(e.entity)}
          >
            ${t.et(`remove_stop`)}
          </button>`:I}
    </ha-alert>
  `}function Gn(e,t,n,r){let{lines:i,picked:a,colorOf:o,typeByLine:s}=r,c=a.size?t.et(`lines_selected`).replace(`{n}`,String(a.size)).replace(`{total}`,String(i.length)):t.et(`lines_empty_means_all`);return P`
    <div class="wl-group">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${t.et(`lines_label`)}</span>
        ${i.length?P`<span class="wl-note">${c}</span>`:I}
      </div>
      ${i.length?P`<div class="wl-chips">
            ${i.map(r=>{let i=t.singleLine?a.has(r):a.size===0||a.has(r),c=ft(s.get(r));return P`<button
                type="button"
                class="wl-chip"
                style=${U(Rn(o(r)))}
                aria-pressed=${i?`true`:`false`}
                aria-label=${t.et(i?`line_active_aria`:`line_inactive_aria`).replace(`{line}`,r)}
                @click=${()=>n.toggleLine(e.entity,r)}
              >
                ${c?P`<span class="wl-chip-mode"
                      ><ha-icon icon=${c} aria-hidden="true"></ha-icon
                    ></span>`:I}
                ${r}
              </button>`})}
          </div>`:P`<div class="wl-empty">
            <span class="wl-empty-title">${t.et(`no_lines_title`)}</span>
            <span class="wl-note">${t.et(`no_lines_hint`)}</span>
          </div>`}
    </div>
  `}function Kn(e,t,n,r){let{attrs:i,triplets:a,picked:o,lines:s,dirStrings:c}=r,l=Ut(s,o),u=l.length===1?l[0]:void 0,d=e.direction??null,f=Ht(i,u),p=f.available.has(`H`),m=f.available.has(`R`),h=f.oneWay!==null,g=d===`H`||d===null&&f.oneWay===`H`,_=d===`R`||d===null&&f.oneWay===`R`,v=d===null&&!h,y=t=>{let r={};for(let[t,n]of Object.entries(e.line_directions??{}))l.includes(t)||(r[t]=n);n.setDirections(e.entity,{direction:t,lineDirections:r})},b=e=>f.unknown||f.available.has(e)?Vt(Vn(a,e,u),c(e)):`${c(e).short}: ${t.et(`direction_not_served`)}`,x=f.oneWay!==null&&l.length===1?t.et(`direction_note_one_way`).replace(`{line}`,l[0]??``):``;return P`
    <div class="wl-group">
      <span class="wl-label">${t.et(`direction_label`)}</span>
      <div class="wl-dirs">
        ${X({label:b(`H`),active:g,disabled:!f.unknown&&!p,title:p||f.unknown?t.t(`dir_h`):t.et(`direction_unavailable`),onClick:()=>y(`H`)})}
        ${X({label:b(`R`),active:_,disabled:!f.unknown&&!m,title:m||f.unknown?t.t(`dir_r`):t.et(`direction_unavailable`),onClick:()=>y(`R`)})}
        ${t.singleLine?I:X({label:t.t(`dir_both`),active:v,disabled:h,title:h?t.et(`direction_unavailable`):t.t(`dir_both`),onClick:()=>y(null)})}
      </div>
      ${x?P`<span class="wl-note">${x}</span>`:I}
    </div>
  `}function X(e){return P`<button
    type="button"
    class=${H({"wl-dir":!0,"wl-dir--compact":!!e.compact})}
    aria-pressed=${e.active?`true`:`false`}
    aria-disabled=${e.disabled?`true`:`false`}
    aria-label=${e.ariaLabel??e.label}
    title=${e.title}
    @click=${t=>{if(e.disabled){t.preventDefault();return}e.onClick()}}
  >
    ${e.icon?P`<ha-icon icon=${e.icon} aria-hidden="true"></ha-icon>`:e.label}
  </button>`}function qn(e,t,n,r){let{attrs:i,triplets:a,picked:o,lines:s,colorOf:c,dirStrings:l}=r,u=Ut(s,o),d=e.line_directions??{},f=e.direction??null,p=e=>d[e]??f,m=(t,r)=>{let i={};for(let e of u){let n=e===t?r:p(e);n&&(i[e]=n)}for(let[e,t]of Object.entries(d))u.includes(e)||(i[e]=t);n.setDirections(e.entity,{direction:null,lineDirections:i})};return P`
    <div class="wl-group">
      <span class="wl-label">${t.et(`direction_label`)}</span>
      ${u.map(e=>{let n=Ht(i,e),r=p(e),o=n.available.has(`H`),s=n.available.has(`R`),u=n.oneWay!==null,d=n.unknown,f=n=>t.et(`per_line_direction_aria`).replace(`{line}`,e).replace(`{direction}`,n===null?t.t(`dir_both`):Vt(Vn(a,n,e),l(n)));return P`
          <div class="wl-override-row">
            <span class="wl-badge" style=${U(zn(c(e)))}
              >${e}</span
            >
            <div class="wl-dirs">
              ${X({label:l(`H`).short,active:r===`H`||r===null&&n.oneWay===`H`,disabled:!d&&!o,compact:!0,title:Vn(a,`H`,e).join(` / `)||t.t(`dir_h`),ariaLabel:f(`H`),onClick:()=>m(e,`H`)})}
              ${X({label:l(`R`).short,active:r===`R`||r===null&&n.oneWay===`R`,disabled:!d&&!s,compact:!0,title:Vn(a,`R`,e).join(` / `)||t.t(`dir_r`),ariaLabel:f(`R`),onClick:()=>m(e,`R`)})}
              ${X({label:``,icon:`mdi:swap-horizontal`,active:r===null&&!u,disabled:u,compact:!0,title:t.t(`dir_both`),ariaLabel:f(null),onClick:()=>m(e,null)})}
            </div>
          </div>
        `})}
    </div>
  `}function Jn(e,t,n,r){let{attrs:i,picked:a,colorOf:o,lines:s,dirStrings:c}=r,l=Jt(i,{lines:s,picked:a,lineDirections:e.line_directions??{},stopDirection:e.direction??null});return l.length?P`
    <div class="wl-group wl-divide">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${t.et(`section_walk_time`)}</span>
        <span class="wl-note">${t.et(`walk_time_unit`)}</span>
      </div>
      <span class="wl-note">${t.et(`walk_time_hint`)}</span>
      <div class="wl-walk-list">
        ${l.map(r=>{let i=Rt(r.line,r.direction),a=e.walk_times?.[i],s=r.termini.length?r.termini.join(` / `):r.direction===`H`||r.direction===`R`?c(r.direction).full:``,l=t.et(`walk_time_aria`).replace(`{line}`,r.line).replace(`{towards}`,s),u=t=>{let r=(a??0)+t;n.setWalkTime(e.entity,i,r<1?null:Math.min(120,r))};return P`
            <div class="wl-walk-row">
              <span class="wl-badge" style=${U(zn(o(r.line)))}
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
                  .value=${Fn(a===void 0?``:String(a))}
                  @keydown=${In}
                  @keyup=${In}
                  @keypress=${In}
                  @change=${t=>n.setWalkTime(e.entity,i,Ln(t.target.value,`${e.entity}/${i}`))}
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
  `:I}function Yn(e,t){let n=(n,r)=>{let i=e();i&&t(i.map(e=>e.entity===n?r({...e}):e))};return{toggleLine:(e,t)=>n(e,e=>{let n=new Set(e.lines??[]);return n.has(t)?n.delete(t):n.add(t),n.size?e.lines=[...n]:delete e.lines,e}),setDirections:(e,t)=>n(e,e=>(t.direction===null?delete e.direction:e.direction=t.direction,Object.keys(t.lineDirections).length?e.line_directions=t.lineDirections:delete e.line_directions,e)),setWalkTime:(e,t,r)=>n(e,e=>{let n={...e.walk_times??{}};return r===null?delete n[t]:n[t]=r,Object.keys(n).length?e.walk_times=n:delete e.walk_times,e}),remove:n=>{let r=e();r&&t(r.filter(e=>e.entity!==n))}}}function Xn(e,t){let n=Array.isArray(t)?t.filter(e=>typeof e==`string`&&e.length>0):[],r=new Map(e.map(e=>[e.entity,e]));return n.map(e=>r.get(e)??{entity:e})}function Zn(e,t,n){let r=t.et(n);return r===n?e?.localize?.(`ui.panel.lovelace.editor.card.generic.${n}`)||n:r}function Qn(e,t,n){let r=n?.[t];if(r!==void 0)return r;let i=`${t}_helper`,a=e.et(i);return a===i?void 0:a}function Z(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}let $n=class extends z{constructor(...e){super(...e),this._tab=`stops`,this._onEntitiesChanged=e=>{e.stopPropagation(),this._config&&this._commit(Mt({...this._config,entities:Xn(this._config.entities,e.detail.value.entities)}))},this._computeLabel=e=>Zn(this.hass,this._i18n,e.name),this._computeHelper=e=>{let{et:t}=this._i18n,n=this._config;return Qn(this._i18n,e.name,{...n?.show_accessibility?{}:{accessibility_only:t(`accessibility_only_requires`)},...n?.show_delay?{}:{show_delay_colors:t(`show_delay_colors_requires`)},...(n?.entities.length??0)>=2?{}:{layout:t(`layout_requires`)}})}}setConfig(e){this._config=Mt(e)}shouldUpdate(e){if(!this._config)return!1;if(e.has(`_config`)||e.has(`_tab`))return!0;let t=e.get(`hass`);return!t||!this.hass||this._config.entities.map(e=>e.entity).some(e=>t.states[e]!==this.hass.states[e])}get _i18n(){return En(`modern`,this.hass?.language)}_commit(e){this._config=e,dt(this,`config-changed`,{config:e})}_patch(e){this._config&&this._commit(Mt({...this._config,...e}))}get _stopCallbacks(){return Yn(()=>this._config?.entities,e=>{this._config&&this._commit({...this._config,entities:e})})}render(){if(!this._config)return I;let{et:e}=this._i18n;return P`
      <div class="wl-editor">
        ${Dn([{key:`stops`,label:e(`tab_stops`)},{key:`display`,label:e(`tab_display`)},{key:`tweaks`,label:e(`tab_tweaks`)}],this._tab,e=>{this._tab=e})}
        ${On(this._tab,this._renderActiveTab())}
      </div>
    `}_renderActiveTab(){switch(this._tab){case`stops`:return this._renderStops();case`display`:return this._renderDisplay();case`tweaks`:return this._renderMisc()}}_renderStops(){let e=this._config,{t,et:n}=this._i18n;return P`
      <ha-form
        .hass=${this.hass}
        .data=${{entities:e.entities.map(e=>e.entity)}}
        .schema=${[{name:`entities`,required:!0,selector:{entity:{multiple:!0,filter:{domain:`sensor`,integration:`wiener_linien_austria`}}}}]}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._onEntitiesChanged}
      ></ha-form>
      ${e.entities.map((r,i)=>Un(this.hass,r,{index:i+1,total:e.entities.length,lineColorOverrides:e.line_colors,t,et:n},this._stopCallbacks))}
    `}_renderDisplay(){let e=this._config,{et:t}=this._i18n,n={hass:this.hass,computeLabel:this._computeLabel,computeHelper:this._computeHelper,onChange:e=>this._patch(e)};return P`
      ${An({...n,title:t(`section_layout`),hint:t(`section_layout_hint`),data:{layout:e.layout,max_departures:e.max_departures,hide_header:e.hide_header,show_hero_metric:e.show_hero_metric,show_departures:e.show_departures,show_stops_ahead:e.show_stops_ahead,show_qr_button:e.show_qr_button},schema:[{name:`layout`,disabled:e.entities.length<2,selector:{select:{mode:`dropdown`,options:[{value:`stacked`,label:t(`layout_stacked`)},{value:`tabs`,label:t(`layout_tabs`)}]}}},{name:`max_departures`,selector:{number:{min:0,max:20,step:1,mode:`slider`}}},{name:`hide_header`,selector:{boolean:{}}},{name:`show_hero_metric`,selector:{boolean:{}}},{name:`show_departures`,selector:{boolean:{}}},{name:`show_stops_ahead`,selector:{boolean:{}}},{name:`show_qr_button`,selector:{boolean:{}}}]})}
      ${An({...n,title:t(`section_departure_row`),hint:t(`section_departure_row_hint`),data:{show_platform:e.show_platform,show_accessibility:e.show_accessibility,accessibility_only:e.accessibility_only,show_cooling:e.show_cooling,show_type_icon:e.show_type_icon},schema:[{name:`show_platform`,selector:{boolean:{}}},{name:`show_accessibility`,selector:{boolean:{}}},{name:`accessibility_only`,disabled:!e.show_accessibility,selector:{boolean:{}}},{name:`show_cooling`,selector:{boolean:{}}},{name:`show_type_icon`,selector:{boolean:{}}}]})}
      ${An({...n,title:t(`section_disruptions`),data:{show_traffic_info:e.show_traffic_info,show_elevator_info:e.show_elevator_info,show_delay:e.show_delay,show_delay_colors:e.show_delay_colors},schema:[{name:`show_traffic_info`,selector:{boolean:{}}},{name:`show_elevator_info`,selector:{boolean:{}}},{name:`show_delay`,selector:{boolean:{}}},{name:`show_delay_colors`,disabled:!e.show_delay,selector:{boolean:{}}}]})}
    `}_renderMisc(){let e=this._config,{et:t}=this._i18n;return P`
      ${this._renderColors()}
      ${An({hass:this.hass,title:t(`section_footer`),data:{hide_attribution:e.hide_attribution},schema:[{name:`hide_attribution`,selector:{boolean:{}}}],computeLabel:this._computeLabel,computeHelper:this._computeHelper,onChange:e=>this._patch(e)})}
    `}_renderColors(){let e=this._config,{et:t}=this._i18n,n=e.entities.map(e=>e.entity),r=Gt(this.hass,n),i=Lt(this.hass,n);return kn({title:t(`section_colors`),hint:t(`section_colors_hint`)},r.length?P`<div class="wl-group">
            <span class="wl-note">${t(`colors_hint`)}</span>
            ${r.map(n=>{let r=Pt(n,e.line_colors,i,mt(this.hass),`#888888`),a=r.fill,o=a.startsWith(`#`)?a:`#888888`,s=!!e.line_colors[n.toUpperCase()],c=t(`pick_color_for_line`).replace(`{line}`,n);return P`
                <div class="wl-color-row">
                  <span
                    class="wl-badge"
                    style=${U({background:a,...r.ink?{"--wl-chip-ink":r.ink}:{}})}
                    aria-hidden="true"
                    >${n}</span
                  >
                  <label class="wl-color-field" title=${c}>
                    <span
                      class="wl-swatch"
                      style=${U({background:o})}
                      aria-hidden="true"
                    ></span>
                    <span class="wl-color-hex">${o.toUpperCase()}</span>
                    <input
                      type="color"
                      class="wl-color-input"
                      .value=${o}
                      aria-label=${c}
                      @input=${e=>this._setLineColor(n,e.target.value)}
                      @change=${e=>this._setLineColor(n,e.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    class="wl-icon-btn"
                    ?disabled=${!s}
                    aria-label=${t(`reset_color_aria`).replace(`{line}`,n)}
                    title=${t(`reset_color`)}
                    @click=${()=>this._resetLineColor(n)}
                  >
                    <ha-icon icon="mdi:restore" aria-hidden="true"></ha-icon>
                  </button>
                </div>
              `})}
          </div>`:P`<div class="wl-empty">
            <span class="wl-empty-title">${t(`no_lines_title`)}</span>
            <span class="wl-note">${t(`colors_empty_hint`)}</span>
          </div>`)}_setLineColor(e,t){this._config&&this._commit({...this._config,line_colors:{...this._config.line_colors,[e.toUpperCase()]:t}})}_resetLineColor(e){if(!this._config)return;let t={...this._config.line_colors};delete t[e.toUpperCase()],this._commit({...this._config,line_colors:t})}static{this.styles=[Tn,wn]}};Z([Me({attribute:!1})],$n.prototype,`hass`,void 0),Z([B()],$n.prototype,`_config`,void 0),Z([B()],$n.prototype,`_tab`,void 0),$n=Z([ke(`wiener-linien-austria-card-editor`)],$n);var Q;{let e=window;e.customCards=e.customCards??[],e.customCards.some(e=>e.type===`wiener-linien-austria-card`)||e.customCards.push({type:`wiener-linien-austria-card`,name:`Wiener Linien Austria`,description:`Abfahrtsmonitor mit Störungen und Aufzugsinfo`,preview:!0,getEntitySuggestion:(e,t)=>!t.startsWith(`sensor.`)||e?.entities?.[t]?.platform!==`wiener_linien_austria`?null:{config:{type:`custom:wiener-linien-austria-card`,entities:[t]}}})}function er(e){return e===`ptMetro`?`platform_short_rail`:`platform_short_bus`}const tr=new Map;function nr(e){let t=tr.get(e);return t||(t=new Intl.DateTimeFormat(`en-GB`,{timeZone:e,hour:`2-digit`,minute:`2-digit`,hour12:!1}),tr.set(e,t)),t}let $=class extends z{static{Q=this}constructor(...e){super(...e),this._activeTab=0,this._versionMismatch=null,this._expandedTraffic=new Set,this._expandedElevator=new Set,this._expandedRows=new Set,this._expandedTransfers=new Set,this._debugTraffic=[],this._debugElevator=[],this._qrOpenFor=null,this._devPaletteOpen=!1,this._versionCheckDone=!1,this._fallbackWarned=!1,this._resolvedStopsMemo=null,this._nightlineHourMemo=null,this._devTogglePalette=()=>{this._devPaletteOpen=!this._devPaletteOpen},this._devTrafficVariant=0,this._devElevatorVariant=0,this._devTestTraffic=()=>{let e=this._resolveStops(),t=[];for(let n of e)for(let e of this._attrs(n.entity).departures??[])e.line&&e.towards&&t.push(e);let n=this._randomFrom(t),r=n?.line||`U?`,i=n?.towards||`Unbekannt`,a=new Date,o=Q.DEV_TRAFFIC_SHAPES,s=o[this._devTrafficVariant%o.length];this._devTrafficVariant+=1;let c=s.html(r,i);this._debugTraffic=[...this._debugTraffic,{name:`DEBUG-T-${Date.now()}`,title:`${r}: ${s.label}`,description:c.replace(/<[^>]+>/g,` `).replace(/\s+/g,` `).trim(),description_html:c,location:`Debug-Stelle`,related_lines:[r],time_start:new Date(a.getTime()-18e5).toISOString(),time_end:new Date(a.getTime()+108e5).toISOString(),time_created:new Date(a.getTime()-18e5).toISOString(),time_last_update:a.toISOString(),status:`active`}]},this._devTestElevator=()=>{let e=this._resolveStops(),t=this._randomFrom(e);if(!t)return;let n=this._attrs(t.entity),r=n.stop_name||t.entity,i=n.departures??[],a=this._randomFrom(i),o=a?.line||``,s=a?.towards||`Unbekannt`,c=new Date,l=[{description:`${o||`U3`} Mittelbahnsteig - Zwischengeschoss Zugang ${r} - Ausgang ${r}`,reason:`Aufzug ist wegen Bauarbeiten bis 03.08.2026 außer Betrieb!`},{description:`${o||`U6`} Bahnsteig Richtung ${s} - Ausgang ${r}`,reason:`An der Instandsetzung wird bereits gearbeitet.`},{description:`Ausgang ${r}`,reason:`Der Aufzug steht aus nicht näher bekannter Ursache still.`}],u=l[this._devElevatorVariant%l.length];this._devElevatorVariant+=1,this._debugElevator=[...this._debugElevator,{__debug_entity:t.entity,name:`DEBUG-E-${Date.now()}`,station:r,description:u.description,reason:u.reason,status:`außer Betrieb`,related_lines:o?[o]:[],time_start:new Date(c.getTime()-27e5).toISOString(),time_end:new Date(c.getTime()+144e5).toISOString()}]},this._devClear=()=>{this._debugTraffic=[],this._debugElevator=[],this._devPaletteOpen=!1}}setConfig(e){if(!e||typeof e!=`object`)throw Error(`wiener-linien-austria-card: config must be an object`);let t=Array.isArray(e.entities),n=typeof e.entity==`string`;if(!t&&!n)throw Error(`wiener-linien-austria-card: 'entities' (array) or legacy 'entity' (string) is required`);let r=Mt(e);if((Array.isArray(e.entities)?e.entities.length:+!!n)>0&&r.entities.length===0)throw Error("wiener-linien-austria-card: every configured entity was rejected (must start with `sensor.`) — see browser console for per-entry details");this._config=r,this._expandedRows=new Set,this._expandedTraffic=new Set,this._expandedElevator=new Set,this._expandedTransfers=new Set,this._qrOpenFor=null,this._activeTab=0,this._fallbackWarned=!1,this._debugTraffic=[],this._debugElevator=[]}getCardSize(){let e=this._config?.entities.length??1;return Math.min(12,3+e*3)}getGridOptions(){return{columns:12,rows:`auto`,min_columns:6,min_rows:3}}static getConfigElement(){return document.createElement(`wiener-linien-austria-card-editor`)}static getStubConfig(e){let t=Ft(e)[0];return{entities:t?[t]:[],max_departures:6}}connectedCallback(){super.connectedCallback(),Be(),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion())}willUpdate(e){if(this._resolvedStopsMemo=null,this._nightlineHourMemo=null,this._config&&(e.has(`_config`)||e.has(`hass`))){let e=this._resolveStops();e.length&&this._activeTab>=e.length&&(this._activeTab=0),this._qrOpenFor&&(new Set(e.map(e=>e.entity)).has(this._qrOpenFor)||(this._qrOpenFor=null))}}updated(e){if(!e.has(`_qrOpenFor`)&&!e.has(`hass`)&&!e.has(`_config`)||!this._qrOpenFor)return;let t=this.renderRoot.querySelector(`.qr-panel.expanded .qr-canvas`);if(!t)return;let n=t.getAttribute(`data-qr-text`)??``,r=t.getAttribute(`data-qr-rendered-for`)??``;n&&n!==r&&(this._renderTintedQr(t),t.setAttribute(`data-qr-rendered-for`,n))}_renderTintedQr(e){let t=e.closest(`.station`),n=t&&getComputedStyle(t).getPropertyValue(`--wl-accent`).trim()||`#000`;for(;e.firstChild;)e.removeChild(e.firstChild);Le.render({text:e.getAttribute(`data-qr-text`)??``,radius:0,ecLevel:`H`,fill:n,background:`#fff`,size:220},e);let r=e.querySelector(`canvas`);if(!(r instanceof HTMLCanvasElement)){console.error(`[wiener-linien-austria-card] QR canvas unavailable`);return}let i=r.getContext(`2d`);if(!i){console.error(`[wiener-linien-austria-card] QR canvas unavailable`);return}let a=_n(e.getAttribute(`data-qr-icon`)??`mdi:bus-stop`),o=r.width,s=r.height,c=Math.round(o*.22),l=Math.round((o-c)/2),u=Math.round((s-c)/2),d=Math.round(c*.18),f=l-d,p=u-d,m=c+d*2,h=Math.round(c*.2);i.fillStyle=`#fff`,typeof i.roundRect==`function`?(i.beginPath(),i.roundRect(f,p,m,m,h),i.fill()):i.fillRect(f,p,m,m),i.save(),i.translate(l,u),i.scale(c/24,c/24),i.fillStyle=n,i.fill(new Path2D(a)),i.restore()}shouldUpdate(e){if(!this._config)return!1;if(e.has(`_config`)||e.has(`_activeTab`)||e.has(`_versionMismatch`)||e.has(`_expandedTraffic`)||e.has(`_expandedElevator`)||e.has(`_expandedRows`)||e.has(`_expandedTransfers`)||e.has(`_qrOpenFor`)||e.has(`_debugTraffic`)||e.has(`_debugElevator`))return!0;let t=e.get(`hass`);return!t||!this.hass||this._resolveStops().map(e=>e.entity).some(e=>t.states[e]!==this.hass.states[e])}_lang(){return this.hass?.language?.startsWith(`de`)?`de`:`en`}_t(e,t){return at(`modern.${e}`,{hassLanguage:this.hass?.language},t)}async _checkCardVersion(){try{this._versionMismatch=await ot(this.hass,`wiener_linien_austria/card_version`,`2.0.0`)}catch(e){console.warn(`[wiener-linien-austria-card] version probe failed`,e)}}_resolveStops(){if(this._resolvedStopsMemo!==null)return this._resolvedStopsMemo;let e=this._computeResolvedStops();return this._resolvedStopsMemo=e,e}_computeResolvedStops(){let e=(this._config?.entities??[]).filter(e=>this.hass?.states?.[e.entity]);if(e.length)return e;let t=Ft(this.hass)[0];if(t){if(!this._fallbackWarned&&(this._config?.entities?.length??0)>0){this._fallbackWarned=!0;let e=this._config?.entities.map(e=>e.entity).join(`, `);console.warn(`[wiener-linien-austria-card] configured entity "${e}" not in hass.states; falling back to "${t}"`)}return[{entity:t}]}return[]}_attrs(e){return this.hass?.states?.[e]?.attributes??{}}render(){if(!this._config)return I;if(!this.hass)return P`<ha-card><div class="wrap"></div></ha-card>`;let e=this._config,t=this._resolveStops(),n=e.layout===`tabs`&&t.length>=2,r=e.hide_attribution?``:t.map(e=>this._attrs(e.entity).attribution).find(e=>typeof e==`string`&&e.length>0)||`Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0`;return P`
      <ha-card>
        ${n?this._renderTabs(t,this._activeTab):I}
        <div class="wrap">
          ${lt(this._versionMismatch,e=>this._t(e))}
          ${e.show_traffic_info?this._renderTrafficBanner(this._bannerStops(t,n)):I}
          ${this._renderBody(t,n)}
          ${this._renderFooter(r)}
        </div>
      </ha-card>
    `}_renderFooter(e){let t=this._isDevMode();return!e&&!t?I:P`
      ${e?P`<div class="foot">
            <span class="timestamp">${e}</span>
          </div>`:I}
      ${t?this._renderDevModePanel():I}
    `}_bannerStops(e,t){return!t||!e.length?e:[e[this._activeTab]??e[0]]}_renderBody(e,t){if(!e.length)return this._renderEmpty();if(t){let t=e[this._activeTab]??e[0];return P`${this._renderStop(t,this._activeTab)}`}return P`${e.map(e=>this._renderStop(e))}`}_renderEmpty(){let e=Ft(this.hass).length?`no_entities_picked`:`no_entities_available`;return P`<div class="empty" role="status" aria-live="polite">${this._t(e)}</div>`}_renderTabs(e,t){return P`
      <div class="tabbar">
        <div class="tabs" role="tablist">
        ${e.map((n,r)=>{let i=this._attrs(n.entity),a=i.stop_name||i.friendly_name||n.entity,o={tab:!0,active:r===t},s=r===t;return P`<button
            type="button"
            role="tab"
            id=${`wl-tab-${r}`}
            aria-controls=${`wl-tabpanel-${r}`}
            class=${H(o)}
            aria-selected=${s?`true`:`false`}
            tabindex=${s?`0`:`-1`}
            @click=${()=>this._setActiveTab(r)}
            @keydown=${t=>this._onTabKeydown(t,r,e.length)}
          >${a}</button>`})}
        </div>
        ${this._renderTabActions(e,t)}
      </div>
    `}_renderTabActions(e,t){if(!this._config.hide_header)return I;let n=e[t]??e[0];if(!n)return I;let r=this._attrs(n.entity),i=r.stop_name||r.friendly_name||n.entity,a=this._stopMapUrl(i,r.latitude,r.longitude),o=this._stopGeoUri(i,r.latitude,r.longitude),s=this._config.show_qr_button!==!1,c=s&&o!==null;return!a&&!c?I:P`<div
      class=${H({"tab-actions":!0,reserved:s})}
    >
      ${this._renderStopActions(n.entity,i,a,c)}
    </div>`}_setActiveTab(e){if(!Number.isFinite(e))return;let t=this._resolveStops(),n=Math.max(0,Math.min(t.length-1,Math.floor(e)));if(n===this._activeTab)return;let r=t[this._activeTab]?.entity,i=t[n]?.entity;r&&i&&this._qrOpenFor===r&&(this._qrOpenFor=i),this._activeTab=n}_onTabKeydown(e,t,n){let r=t;switch(e.key){case`ArrowRight`:r=(t+1)%n;break;case`ArrowLeft`:r=(t-1+n)%n;break;case`Home`:r=0;break;case`End`:r=n-1;break;default:return}e.preventDefault(),this._setActiveTab(r),this.updateComplete.then(()=>{(this.shadowRoot?.querySelectorAll(`.tabs [role="tab"]`))?.[r]?.focus()}).catch(e=>{console.warn(`[wiener-linien-austria-card] tab focus skipped`,e)})}_renderStopHeader(e,t,n,r,i,a,o){return P`<header class="head">
      <span class="icon-tile" aria-hidden="true">
        <ha-icon icon=${i}></ha-icon>
      </span>
      <div class="title-block">
        <h3 class="title">${W(t,e.entity)}</h3>
        ${r?.line?P`<p class="subtitle">${W(r.towards)}</p>`:I}
      </div>
      ${a||o?P`<div class="head-actions">
            ${this._renderStopActions(e.entity,n,a,o)}
          </div>`:I}
    </header>`}_renderStopActions(e,t,n,r){let i=this._t(`open_in_maps`),a=this._t(`qr_open`);return P`
      ${r?P`<button
            type="button"
            class=${H({"icon-action":!0,"qr-toggle":!0,expanded:this._qrOpenFor===e})}
            title=${a}
            aria-label="${a}: ${t}"
            aria-expanded=${this._qrOpenFor===e?`true`:`false`}
            aria-controls="wl-qr-${Yt(e)}"
            @click=${()=>this._toggleQrFor(e)}
          ><ha-icon icon="mdi:qrcode" aria-hidden="true"></ha-icon></button>`:I}
      ${n?P`<a
            class="icon-action"
            href=${n}
            target="_blank"
            rel="noopener noreferrer"
            title=${i}
            aria-label="${i}: ${t}"
          ><ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon></a>`:I}
    `}_renderStopHero(e,t,n,r){return P`<div class="hero-host">
      <div class="hero">
        <div class="hero-time" aria-live="polite" aria-atomic="true">
          <span class="hero-min">${n}</span>
          ${r?P`<span class="hero-unit">${r}</span>`:I}
        </div>
        ${t.flatMap(t=>[this._renderHeroEntry(t,e.entity),this._renderHeroPanelForEntry(t,e.entity)])}
      </div>
    </div>`}_renderStop(e,t){let n=this._attrs(e.entity),r=n.stop_name||n.friendly_name,i=r||e.entity,a=Kt(Array.isArray(n.departures)?n.departures:[],{...e,accessibility_only:this._config.accessibility_only}),o=Array.isArray(n.elevator_info)?n.elevator_info:[],s=this._debugElevator.filter(t=>t.__debug_entity===e.entity),c=[...o,...s],l=this._config.show_elevator_info&&c.length>0,u=this._stopMapUrl(i,n.latitude,n.longitude),d=this._stopGeoUri(i,n.latitude,n.longitude),f=this._config.show_qr_button!==!1&&d!==null,p=!this._config.hide_header||t!==void 0,{heroGroup:m,heroLead:h,rows:g}=Cn(a,{showHeroMetric:this._config.show_hero_metric,maxDepartures:this._config.max_departures}),_=typeof n.stale_departures==`number`?n.stale_departures:0,v=It(this.hass,e.entity),y=h?Nt(h.line||``,this._config.line_colors,v):`var(--primary-color)`,b=pt(h?.type),x=h&&Number.isFinite(h.countdown)?h.countdown:null,S=x===null?`—`:x<=0?this._t(`now`):String(x),C=x!==null&&x>0?this._t(`min`):``,w=Ct(y,this._colorScheme()),T=t!==void 0;return P`
      <section
        class="station"
        style="--wl-accent: ${y};${w?` --wl-accent-text: ${w};`:``}"
        id=${T?`wl-tabpanel-${t}`:I}
        role=${T?`tabpanel`:I}
        aria-labelledby=${T?`wl-tab-${t}`:I}
        tabindex=${T?`0`:I}
        aria-label=${i}
      >
        ${this._config.hide_header?I:this._renderStopHeader(e,r,i,h,b,u,f)}
        ${f&&d&&p?this._renderQrPanel(e.entity,i,d,b,this._qrOpenFor===e.entity):I}

        ${this._config.show_hero_metric&&h?this._renderStopHero(e,m,S,C):I}
        ${l?this._renderElevatorDetails(c):I}
        ${this._config.show_departures&&this._config.max_departures>0?g.length?P`${_>0?P`<div class="stale-note" role="status" aria-live="polite">
                      ${this._t(`stale_feed_partial`)}
                    </div>`:I}
                <ul class="dep-list" role="list" aria-label=${this._t(`departures_list`)}>
                  ${g.map((t,n)=>this._renderRow(t,e.entity,n))}
                </ul>`:this._renderEmptyState(n,_):I}
      </section>
    `}_renderEmptyState(e,t){if(t>0){let t=e.stale_since?yn(e.stale_since,this._lang()):``;return P`<div class="empty stale" role="status" aria-live="polite">
        <div class="empty-title">${this._t(`stale_feed`)}</div>
        <div class="empty-detail">${this._t(`stale_feed_detail`)}</div>
        ${t?P`<div class="empty-meta">
              ${this._t(`stale_feed_since`,{time:t})}
            </div>`:I}
      </div>`}return P`<div class="empty" role="status" aria-live="polite">
      ${this._t(e.server_time?`betriebsschluss`:`no_data`)}
    </div>`}_renderElevatorDetails(e){return P`
      <div class="alert-list">
        ${e.map(e=>this._renderElevatorDetail(e))}
      </div>
    `}_renderElevatorDetail(e){let t=e.description||e.station||``,n=cn(t),r=e.reason||``,i=sn(r),a=yn(e.time_end,this._lang()),o=!!(r||a),s=this._expandedElevator.has(e.name);return P`
      <div
        class=${H({alert:!0,expanded:s,"no-detail":!o})}
        role=${o?`button`:`group`}
        tabindex=${o?`0`:`-1`}
        aria-expanded=${o?s?`true`:`false`:I}
        aria-label=${t}
        @click=${()=>o&&this._toggleElevator(e.name)}
        @keydown=${t=>this._onExpanderKeydown(t,o,()=>this._toggleElevator(e.name))}
      >
        <ha-icon icon="mdi:elevator-passenger-off" aria-hidden="true"></ha-icon>
        <div class="alert-body">
          <div class="alert-summary">
            <div class="alert-title">
              <span lang="de" class="lift-path"
                >${n.map((e,t)=>P`${t?P`<span class="lift-path-sep" aria-hidden="true">›</span>`:I}<span>${e}</span>`)}</span
              >
            </div>
          </div>
          ${o?P`<div class="alert-detail">
                <div class="alert-detail-inner">
                  ${r?P`<div class="alert-desc lift-reason">
                        <ha-icon icon=${i} aria-hidden="true"></ha-icon>
                        <span lang="de">${r}</span>
                      </div>`:I}
                  ${a?P`<div class="alert-meta">
                        <span>${this._t(`elevator_until`)} ${a}</span>
                      </div>`:I}
                </div>
              </div>`:I}
        </div>
        ${o?P`<ha-icon class="alert-chevron" icon="mdi:chevron-down" aria-hidden="true"></ha-icon>`:I}
      </div>
    `}_toggleElevator(e){this._expandedElevator=Xt(this._expandedElevator,e)}_onExpanderKeydown(e,t,n){t&&(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),n())}_renderTrafficBanner(e){let t=new Set,n=[];for(let r of e)for(let e of this._attrs(r.entity).traffic_info??[])t.has(e.name)||(t.add(e.name),n.push(e));for(let e of this._debugTraffic)t.has(e.name)||(t.add(e.name),n.push(e));if(!n.length)return I;let r=Lt(this.hass,this._config.entities.map(e=>e.entity));return P`
      <div class="alert-list">
        ${n.map(e=>this._renderTrafficItem(e,r))}
      </div>
    `}_renderTrafficNotice(e){let t=e.blocks.reduce((e,t)=>t.kind===`heading`?e+1:e,0)>1?e.blocks:e.blocks.filter(e=>e.kind!==`heading`);return P`
      <div class="alert-desc" lang="de">
        ${t.map(e=>e.kind===`heading`?P`<p class="alert-desc-heading">${e.text}</p>`:P`<p>${e.text}</p>`)}
        ${e.facts.length?P`<dl class="alert-facts">
              ${e.facts.map(e=>P`<div class="alert-fact">
                  <dt>
                    <ha-icon icon=${e.icon} aria-hidden="true"></ha-icon>${e.label}
                  </dt>
                  <dd>${e.value}</dd>
                </div>`)}
            </dl>`:I}
      </div>
    `}_renderTrafficItem(e,t){let n=this._config.line_colors,r=Array.isArray(e.related_lines)?e.related_lines:[],i=Array.isArray(e.inferred_lines)?e.inferred_lines:[],a=r.length?r:i,o=gn(e.description_html||e.description||``),s=o.blocks.length>0||o.facts.length>0,c=yn(e.time_end,this._lang()),l=yn(e.time_last_update,this._lang()),u=yn(e.time_created,this._lang()),d=l&&l!==u?l:``,f=!!(e.location||c||d),p=!!(s||f),m=this._expandedTraffic.has(e.name),h={alert:!0,expanded:m,"no-detail":!p},g=e.title||this._t(`traffic_label`);return P`
      <div
        class=${H(h)}
        role=${p?`button`:`group`}
        tabindex=${p?`0`:`-1`}
        aria-expanded=${p?m?`true`:`false`:I}
        aria-label=${g}
        @click=${()=>p&&this._toggleTraffic(e.name)}
        @keydown=${t=>this._onExpanderKeydown(t,p,()=>this._toggleTraffic(e.name))}
      >
        <ha-icon icon="mdi:alert-octagon" aria-hidden="true"></ha-icon>
        <div class="alert-body">
          <div class="alert-summary">
            ${a.length?P`<div class="alert-lines">
                  ${a.map(e=>P`<span
                      class="alert-line-badge"
                      style=${U(Y(e,n,t))}
                    >${e}</span>`)}
                </div>`:I}
            <div class="alert-title">${e.title?W(e.title):this._t(`traffic_label`)}</div>
          </div>
          ${p?P`<div class="alert-detail">
                <div class="alert-detail-inner">
                  ${s?this._renderTrafficNotice(o):I}
                  ${f?P`<div class="alert-meta">
                        ${e.location?P`<span class="alert-location-chip">
                              <ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon>${W(e.location)}
                            </span>`:I}
                        ${c?P`<span>${this._t(`traffic_until`)} ${c}</span>`:I}
                        ${d?P`<span>${this._t(`traffic_updated`)} ${d}</span>`:I}
                      </div>`:I}
                </div>
              </div>`:I}
        </div>
        ${p?P`<ha-icon class="alert-chevron" icon="mdi:chevron-down" aria-hidden="true"></ha-icon>`:I}
      </div>
    `}_toggleTraffic(e){this._expandedTraffic=Xt(this._expandedTraffic,e)}_expandState(e,t,n){let r=qt(this._config.show_stops_ahead,e),i=this._rowKey(e,t),a=r&&this._expandedRows.has(i),o=this._panelId(e,t,n),s=a?`stops_ahead_aria_hide`:`stops_ahead_aria_show`;return{hasStopsAhead:r,rowKey:i,expanded:a,panelId:o,ariaLabel:r?this._t(s,{line:e.line||`?`,towards:e.towards||``}):``}}_renderStopsAheadInner(e,t,n,r){let i=this._config.line_colors,a=It(this.hass,r);return P`
      <ol
        class="stops-ahead"
        style=${U({"--stops-ahead-line":Nt(t,i,a)})}
      >
        ${e.map((e,t)=>this._renderStopAhead(e,t,n,i,a))}
      </ol>
    `}_renderHeroEntry(e,t){let n=Y(e.line||``,this._config.line_colors,It(this.hass,t)),r=this._config.show_platform&&e.platform?String(e.platform):null,i=!!e.barrier_free&&this._config.show_accessibility,a=!!e.cooling&&this._config.show_cooling,o=this._config.show_type_icon?ft(e.type):null,{hasStopsAhead:s,rowKey:c,expanded:l,panelId:u,ariaLabel:d}=this._expandState(e,t,`hero`),f={"hero-entry":!0,expandable:s,expanded:l},p=e.line||`?`;return P`
      <div
        class=${H(f)}
        style=${s?`--stops-ahead-line: ${n.background};`:I}
        role=${s?`button`:I}
        tabindex=${s?`0`:I}
        aria-expanded=${s?l?`true`:`false`:I}
        aria-controls=${s?u:I}
        aria-label=${s?d:I}
        @click=${()=>s&&this._toggleRow(c)}
        @keydown=${e=>this._onExpanderKeydown(e,s,()=>this._toggleRow(c))}
      >
        <span
          class="line-badge"
          style=${U(n)}
        >${p}</span>
        ${o?P`<ha-icon
              class="type-icon"
              icon=${o}
              aria-hidden="true"
            ></ha-icon>`:I}
        <span class="hero-direction">${W(e.towards)}</span>
        ${r?P`<span class="hero-platform"
              >${this._t(er(e.type))} ${r}</span
            >`:I}
        ${i?P`<span
              class="hero-a11y"
              role="img"
              aria-label=${this._t(`barrier_free_title`)}
              title=${this._t(`barrier_free_title`)}
            >
              <ha-icon
                icon="mdi:wheelchair-accessibility"
                aria-hidden="true"
              ></ha-icon>
            </span>`:I}
        ${a?P`<span
              class="hero-cooling"
              role="img"
              aria-label=${this._t(`cooling_title`)}
              title=${this._t(`cooling_title`)}
            >
              <ha-icon icon="mdi:snowflake" aria-hidden="true"></ha-icon>
            </span>`:I}
        ${s?P`<ha-icon
              class="hero-chevron"
              icon="mdi:chevron-down"
              aria-hidden="true"
            ></ha-icon>`:I}
      </div>
    `}_renderHeroPanelForEntry(e,t){let{hasStopsAhead:n,rowKey:r,expanded:i,panelId:a}=this._expandState(e,t,`hero`);return n?this._renderStopsAheadPanel(`hero`,e.stops_ahead,a,i,e.line||`?`,r,t):I}_renderStopsAheadPanel(e,t,n,r,i,a,o){let s=e===`hero`?`hero-detail`:`dep-row-detail`,c=H({[s]:!0,expanded:r}),l=r?`false`:`true`,u=P`
      <div class="${s}-inner">
        ${this._renderStopsAheadInner(t,i,a,o)}
      </div>
    `;return e===`hero`?P`<div
          class=${c}
          id=${n}
          role="region"
          aria-hidden=${l}
        >
          ${u}
        </div>`:P`<li class=${c} id=${n} role="region" aria-hidden=${l}>
          ${u}
        </li>`}_colorScheme(){return mt(this.hass)}_rowAccentText(e){let t=this._colorScheme();return t===void 0?null:Ct(e,t)??`var(--primary-text-color)`}_renderRow(e,t,n=0){let r=this._config.line_colors,i=It(this.hass,t),a=e.line||`?`,o=Y(a,r,i),{countdown:s,signedDelay:c,cdState:l,hasFlags:u,platform:d}=bn(e,{showDelayColors:this._config.show_delay_colors,showAccessibility:this._config.show_accessibility,showCooling:this._config.show_cooling,showPlatform:this._config.show_platform}),f=this._config.show_accessibility,p=this._config.show_cooling,m=s===null?`—`:s<=0?this._t(`now`):`${s} ${this._t(`min`)}`,h=this._config.show_delay&&c!==null&&c>=1?c===1?this._t(`delay_singular`):this._t(`delay_plural`,{n:c}):``,g=l===`now`?this._rowAccentText(o.background):null,_=this._config.show_type_icon?ft(e.type):null,{hasStopsAhead:v,rowKey:y,expanded:b,panelId:x,ariaLabel:S}=this._expandState(e,t,`row`),C=P`
      <li
        class=${H({"dep-row":!0,expandable:v,expanded:b})}
        style=${`--row-i: ${n};${g?` --wl-accent-text: ${g};`:``}${v?` --stops-ahead-line: ${o.background};`:``}`}
        role=${v?`button`:I}
        tabindex=${v?`0`:I}
        aria-expanded=${v?b?`true`:`false`:I}
        aria-controls=${v?x:I}
        aria-label=${v?S:I}
        @click=${()=>v&&this._toggleRow(y)}
        @keydown=${e=>this._onExpanderKeydown(e,v,()=>this._toggleRow(y))}
      >
        <div class="line-badge" style=${U(o)}>${a}</div>
        <div class="towards">
          ${_?P`<ha-icon class="type-icon" icon=${_} aria-hidden="true"></ha-icon>`:I}
          <div class="towards-rows">
            <span class="towards-name">${W(e.towards)}</span>${h?P`<span class="delay">${h}</span>`:I}
          </div>
        </div>
        ${d||u?P`<span class="row-end">
              ${d?P`<span class="row-platform"
                    >${this._t(er(e.type))} ${d}</span
                  >`:I}
              ${u?P`<span class="row-flags">
                    ${e.traffic_jam?P`<ha-icon
                          class="disturbance"
                          icon="mdi:alert-circle"
                          role="img"
                          aria-label=${this._t(`disturbance_title`)}
                          title=${this._t(`disturbance_title`)}
                        ></ha-icon>`:I}
                    ${f&&e.barrier_free?P`<ha-icon
                          class="a11y"
                          icon="mdi:wheelchair-accessibility"
                          role="img"
                          aria-label=${this._t(`barrier_free_title`)}
                          title=${this._t(`barrier_free_title`)}
                        ></ha-icon>`:I}
                    ${p&&e.cooling?P`<ha-icon
                          class="cooling"
                          icon="mdi:snowflake"
                          role="img"
                          aria-label=${this._t(`cooling_title`)}
                          title=${this._t(`cooling_title`)}
                        ></ha-icon>`:I}
                  </span>`:I}
            </span>`:P`<span></span>`}
        <!-- Conditional spread avoids classMap({ "": true }) when cdState is "". -->
        <div class=${H({countdown:!0,...l?{[l]:!0}:{}})}>${m}</div>
        ${v?P`<ha-icon
              class="row-chevron"
              icon="mdi:chevron-down"
              aria-hidden="true"
            ></ha-icon>`:I}
      </li>
    `;return v?[C,this._renderStopsAheadPanel(`row`,e.stops_ahead,x,b,a,y,t)]:C}_renderStopAhead(e,t,n,r,i){let a=e.lines??[],o=this._isNightlineHour(),s=[],c=[];for(let e of a)/^U\d/.test(e)||o&&/^N\d/.test(e)?s.push(e):c.push(e);let l=this._transferKey(n,t),u=this._expandedTransfers.has(l),d={"stops-ahead-stop":!0,terminus:!!e.is_terminus,"transfers-expanded":u},f=s.length?P`<span class="stops-ahead-metros">
          ${s.map(e=>P`<span
              class="stops-ahead-line-chip"
              style=${U(Y(e,r,i))}
              >${e}</span
            >`)}
        </span>`:I,p=c.length?P`<button
          type="button"
          class="stops-ahead-other-toggle"
          aria-expanded=${u?`true`:`false`}
          aria-label=${this._t(u?`stops_ahead_other_hide`:`stops_ahead_other_show`,{count:c.length,stop:e.name})}
          @click=${e=>{e.stopPropagation(),this._toggleTransfers(l)}}
          @keydown=${e=>{(e.key===`Enter`||e.key===` `)&&e.stopPropagation()}}
        >
          <span class="stops-ahead-other-count">+${c.length}</span>
          <ha-icon icon="mdi:chevron-down" aria-hidden="true"></ha-icon>
        </button>`:I,m=c.length&&u?P`<div class="stops-ahead-others">
            ${c.map(e=>P`<span
                class="stops-ahead-line-chip stops-ahead-line-chip--other"
                style=${U(Y(e,r,i))}
                >${e}</span
              >`)}
          </div>`:I,h=c.length>0,g=h?this._t(u?`stops_ahead_other_hide`:`stops_ahead_other_show`,{count:c.length,stop:e.name}):``;return P`
      <li class=${H(d)}>
        <div
          class="stops-ahead-row"
          role=${h?`button`:I}
          tabindex=${h?`0`:I}
          aria-expanded=${h?u?`true`:`false`:I}
          aria-label=${h?g:I}
          @click=${h?e=>{e.stopPropagation(),this._toggleTransfers(l)}:I}
          @keydown=${h?e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),e.stopPropagation(),this._toggleTransfers(l))}:I}
        >
          <span class="stops-ahead-dot" aria-hidden="true"></span>
          <span class="stops-ahead-name">${W(e.name)}</span>
          ${f} ${p}
        </div>
        ${m}
      </li>
    `}_toggleTransfers(e){this._expandedTransfers=Xt(this._expandedTransfers,e)}_isNightlineHour(){if(this._nightlineHourMemo!==null)return this._nightlineHourMemo;let e=nr(`Europe/Vienna`).formatToParts(new Date),t=Number(e.find(e=>e.type===`hour`)?.value??`0`),n=Number(e.find(e=>e.type===`minute`)?.value??`0`),r=t*60+n,i=r>=1435||r<=315;return this._nightlineHourMemo=i,i}_rowKey(e,t){let n=e.time_planned??`cd${e.countdown}`;return`${t}|${e.line}|${e.direction}|${e.towards??``}|${n}`}_panelId(e,t,n){let r=Yt(t),i=n===`hero`?`wl-hero-stopsahead`:`wl-stopsahead`,a=(e.time_planned??`cd${e.countdown}`).replace(/[^a-z0-9_-]/gi,`_`);return`${i}-${r}-${e.line}-${e.direction}-${a}`}_toggleRow(e){this._expandedRows=Xt(this._expandedRows,e)}_transferKey(e,t){return`${e}|${t}`}_stopMapUrl(e,t,n){let r=null;return typeof t==`number`&&typeof n==`number`?r=`https://stadtplan.wien.gv.at/#/@${n},${t},17.5,0,0,standard/themes`:e&&(r=`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${e}, Wien`)}`),r&&ut(r)||null}_stopGeoUri(e,t,n){return typeof t!=`number`||typeof n!=`number`?null:`geo:${t},${n}?q=${t},${n}${e?`(${encodeURIComponent(e)})`:``}`}_toggleQrFor(e){this._qrOpenFor=this._qrOpenFor===e?null:e}_renderQrPanel(e,t,n,r,i){let a=`wl-qr-${Yt(e)}`,o=this._t(`qr_dialog_title`),s=this._t(`qr_dialog_hint`);return P`
      <div
        class=${H({"qr-panel":!0,expanded:i})}
        id=${a}
        role="region"
        aria-hidden=${i?`false`:`true`}
        aria-label="${o}: ${t}"
      >
        <div class="qr-panel-inner">
          <div
            class="qr-panel-body"
            role="button"
            tabindex=${i?`0`:`-1`}
            aria-label=${this._t(`qr_dialog_close`)}
            @click=${()=>this._toggleQrFor(e)}
            @keydown=${t=>this._onExpanderKeydown(t,!0,()=>this._toggleQrFor(e))}
          >
            <div
              class="qr-canvas"
              role="img"
              aria-label="${o}: ${t}"
              data-qr-text=${n}
              data-qr-icon=${r}
            ></div>
            <p class="qr-panel-hint">${s}</p>
          </div>
        </div>
      </div>
    `}_isDevMode(){try{if((window.location.search||``).includes(`wl_debug=1`)||window.localStorage?.getItem(`wl_debug`)===`1`)return!0}catch(e){console.warn(`[wiener-linien-austria-card] dev-mode probe failed (SSR/restricted ctx?)`,e)}return!1}_renderDevModePanel(){return this._isDevMode()?P`
      <div class="dev-strip">
        <span class="dev-strip-label">${this._t(`devmode_title`)}</span>
        <button type="button" @click=${this._devTestTraffic}>${this._t(`devmode_traffic_btn`)}</button>
        <button type="button" @click=${this._devTestElevator}>${this._t(`devmode_elevator_btn`)}</button>
        <button
          type="button"
          aria-expanded=${this._devPaletteOpen?`true`:`false`}
          @click=${this._devTogglePalette}
        >
          ${this._t(`devmode_colors_btn`)}
        </button>
        <button type="button" class="dev-strip-clear" @click=${this._devClear}>
          ${this._t(`devmode_clear_btn`)}
        </button>
      </div>
      ${this._devPaletteOpen?this._renderDevPalette():I}
    `:I}static{this.DEV_GROUNDS={dark:`#1c1c1c`,light:`#ffffff`}}static{this.DEV_SURFACES=[{label:`hero`,ratio:.12},{label:`row`,ratio:.06}]}static{this.DEV_PALETTE=[{label:`U1`,hex:`#E3000F`},{label:`U2`,hex:`#A862A4`},{label:`U3`,hex:`#EF7C00`},{label:`U4`,hex:`#319F49`},{label:`U6`,hex:`#9D6830`},{label:`Tram`,hex:`#C00808`},{label:`Bus`,hex:`#0A295D`},{label:`Nightline`,hex:Ve},{label:`Badner Bahn`,hex:`#000000`},{label:`Weiß`,hex:`#FFFFFF`}]}_devPaletteEntries(){let e=Q.DEV_PALETTE.map(e=>({...e,live:!1})),t=new Set(e.map(e=>e.hex.toUpperCase())),n=Lt(this.hass,(this._config?.entities??[]).map(e=>e.entity));for(let[r,i]of Object.entries(n)){if(!i?.bg)continue;let n=`#${i.bg}`.toUpperCase();t.has(n)||(t.add(n),e.push({label:r,hex:n,live:!0}))}return e}_renderDevPalette(){return P`
      <div class="dev-palette">
        ${this._devPaletteEntries().map(e=>this._renderDevPaletteRow(e))}
      </div>
    `}_renderDevPaletteRow(e){return P`
      <div class="dev-pal-row">
        <div class="dev-pal-id">
          <span class="dev-pal-badge" style="background: ${e.hex};">${e.label}</span>
          <code>${e.hex.toUpperCase()}${e.live?` ·live`:``}</code>
        </div>
        ${[`dark`,`light`].map(t=>{let n=Ct(e.hex,t),r=Q.DEV_GROUNDS[t];return P`
            <div class="dev-pal-scheme" style="background: ${r};">
              <span class="dev-pal-scheme-label">${t}</span>
              ${Q.DEV_SURFACES.map(t=>{let i=St(e.hex,r,t.ratio)??r,a=n?xt(n,i):null,o=a!==null&&a>=4.5;return P`
                  <div class="dev-pal-chip" style="background: ${i};">
                    <span
                      class="dev-pal-word"
                      style=${n?`color: ${n};`:I}
                      >${this._t(`now`)}</span
                    >
                    <span class="dev-pal-ratio ${o?`pass`:`fail`}">
                      ${a===null?`—`:a.toFixed(2)}
                    </span>
                    <span class="dev-pal-surface">${t.label}</span>
                  </div>
                `})}
              <code class="dev-pal-out">${(n??`—`).toUpperCase()}</code>
            </div>
          `})}
      </div>
    `}_randomFrom(e){return e.length===0?null:e[Math.floor(Math.random()*e.length)]}static{this.DEV_TRAFFIC_SHAPES=[{label:`Bauarbeiten`,html:(e,t)=>`<p>Die Linie ${e} fährt derzeit nicht Richtung ${t}.</p><p><br></p><p>Weichen Sie ersatzweise auf die Linien E3, 46 und 49 aus.</p><p><br></p><p>Voraussichtliche Dauer: 31. August.</p><p><br></p><p>Grund: Bauarbeiten im Bereich zwischen Westbahnhof U und Hütteldorfer Straße U.</p>`},{label:`Run-on (ungetrennt)`,html:e=>`<p>Linie ${e}:Betrieb nur zwischen Schottentor U und Dornbach. Weichen Sie ersatzweise auf die Linie 43A aus.Voraussichtliche Dauer: 31.07.2026.Grund: Gleisbauarbeiten im Bereich Dornbacher Straße.</p>`},{label:`Mehrere Linien`,html:e=>`<p>Linie ${e}:</p><p>Kein Betrieb zwischen Lerchenfelder Straße und Franz-Josefs-Bahnhof S.</p><p>Betrieb zwischen Westbahnhof S U und Lerchenfelder Straße.</p><p>Linie 12:</p><p>Betrieb nur zwischen Hillerstraße und Franz-Josefs-Bahnhof S.</p><p>Linien 40, 41, 42:</p><p>Kein Betrieb. Die Außenäste werden von den Linien 37 und 38 übernommen.</p><p>Die Störung dauert voraussichtlich bis Ende August.</p>`},{label:`Unfall, Uhrzeit`,html:e=>`<p>Linie ${e}:</p><p>Unregelmäßige Intervalle in beiden Richtungen.</p><p>Voraussichtliche Dauer: 11:30 Uhr.</p><p>Grund: Verkehrsunfall im Bereich Gersthofer Straße 140.</p>`},{label:`Unbekannter Grund`,html:e=>`<p>Linie ${e}:</p><p>Es kommt zu Verzögerungen im Betrieb.</p><p>Voraussichtliche Dauer: Ende August.</p><p>Grund: Vorübergehend nicht näher bekannte Ursache.</p>`}]}static{this.styles=Re}};Z([Me({attribute:!1})],$.prototype,`hass`,void 0),Z([B()],$.prototype,`_config`,void 0),Z([B()],$.prototype,`_activeTab`,void 0),Z([B()],$.prototype,`_versionMismatch`,void 0),Z([B()],$.prototype,`_expandedTraffic`,void 0),Z([B()],$.prototype,`_expandedElevator`,void 0),Z([B()],$.prototype,`_expandedRows`,void 0),Z([B()],$.prototype,`_expandedTransfers`,void 0),Z([B()],$.prototype,`_debugTraffic`,void 0),Z([B()],$.prototype,`_debugElevator`,void 0),Z([B()],$.prototype,`_qrOpenFor`,void 0),Z([B()],$.prototype,`_devPaletteOpen`,void 0),$=Q=Z([ke(`wiener-linien-austria-card`)],$);export{$ as WienerLinienAustriaCard};
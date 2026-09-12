/*! Wiener Linien Austria — bundled by Rolldown. Edit sources in src/, then `npm run build`. */
var e=Object.defineProperty,t=(t,n)=>{let r={};for(var i in t)e(r,i,{get:t[i],enumerable:!0});return n||e(r,Symbol.toStringTag,{value:`Module`}),r};
/**
* @license
* Copyright 2019 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const n=globalThis,r=n.ShadowRoot&&(n.ShadyCSS===void 0||n.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,i=Symbol(),a=new WeakMap;var o=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(r&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=a.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&a.set(t,e))}return e}toString(){return this.cssText}};const s=e=>new o(typeof e==`string`?e:e+``,void 0,i),c=(e,...t)=>new o(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,i),l=(e,t)=>{if(r)e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let r of t){let t=document.createElement(`style`),i=n.litNonce;i!==void 0&&t.setAttribute(`nonce`,i),t.textContent=r.cssText,e.appendChild(t)}},u=r?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return s(t)})(e):e,{is:d,defineProperty:f,getOwnPropertyDescriptor:p,getOwnPropertyNames:m,getOwnPropertySymbols:h,getPrototypeOf:g}=Object,_=globalThis,v=_.trustedTypes,ee=v?v.emptyScript:``,te=_.reactiveElementPolyfillSupport,y=(e,t)=>e,ne={toAttribute(e,t){
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
switch(t){case Boolean:e=e?ee:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},re=(e,t)=>!d(e,t),ie={attribute:!0,type:String,converter:ne,reflect:!1,useDefault:!1,hasChanged:re};Symbol.metadata??=Symbol(`metadata`),_.litPropertyMetadata??=new WeakMap;var b=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ie){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&f(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=p(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ie}static _$Ei(){if(this.hasOwnProperty(y(`elementProperties`)))return;let e=g(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(y(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y(`properties`))){let e=this.properties,t=[...m(e),...h(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(u(e))}else e!==void 0&&t.push(u(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return l(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?ne:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?ne:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??re)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};b.elementStyles=[],b.shadowRootOptions={mode:`open`},b[y(`elementProperties`)]=new Map,b[y(`finalized`)]=new Map,te?.({ReactiveElement:b}),(_.reactiveElementVersions??=[]).push(`2.1.2`);
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const ae=globalThis,oe=e=>e,x=ae.trustedTypes,se=x?x.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,ce=`$lit$`,S=`lit$${Math.random().toFixed(9).slice(2)}$`,le=`?`+S,ue=`<${le}>`,C=document,w=()=>C.createComment(``),T=e=>e===null||typeof e!=`object`&&typeof e!=`function`,de=Array.isArray,fe=e=>de(e)||typeof e?.[Symbol.iterator]==`function`,pe=`[ 	
\f\r]`,E=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,me=/-->/g,he=/>/g,D=RegExp(`>|${pe}(?:([^\\s"'>=/]+)(${pe}*=${pe}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),ge=/'/g,_e=/"/g,ve=/^(?:script|style|textarea|title)$/i,ye=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),O=ye(1),be=ye(2),k=Symbol.for(`lit-noChange`),A=Symbol.for(`lit-nothing`),xe=new WeakMap,j=C.createTreeWalker(C,129);function Se(e,t){if(!de(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return se===void 0?t:se.createHTML(t)}const Ce=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=E;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===E?c[1]===`!--`?o=me:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=D):(ve.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=D):o=he:o===D?c[0]===`>`?(o=i??E,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?D:c[3]===`"`?_e:ge):o===_e||o===ge?o=D:o===me||o===he?o=E:(o=D,i=void 0);let d=o===D&&e[t+1].startsWith(`/>`)?` `:``;a+=o===E?n+ue:l>=0?(r.push(s),n.slice(0,l)+ce+n.slice(l)+S+d):n+S+(l===-2?t:d)}return[Se(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]};var we=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=Ce(t,n);if(this.el=e.createElement(l,r),j.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=j.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(ce)){let t=u[o++],n=i.getAttribute(e).split(S),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?De:r[1]===`?`?Oe:r[1]===`@`?ke:N}),i.removeAttribute(e)}else e.startsWith(S)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(ve.test(i.tagName)){let e=i.textContent.split(S),t=e.length-1;if(t>0){i.textContent=x?x.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],w()),j.nextNode(),c.push({type:2,index:++a});i.append(e[t],w())}}}else if(i.nodeType===8){if(i.data===le)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(S,e+1))!==-1;)c.push({type:7,index:a}),e+=S.length-1}}a++}}static createElement(e,t){let n=C.createElement(`template`);return n.innerHTML=e,n}};function M(e,t,n=e,r){if(t===k)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=T(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=M(e,i._$AS(e,t.values),i,r)),t}var Te=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??C).importNode(t,!0);j.currentNode=r;let i=j.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new Ee(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Ae(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=j.nextNode(),a++)}return j.currentNode=C,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},Ee=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=M(this,e,t),T(e)?e===A||e==null||e===``?(this._$AH!==A&&this._$AR(),this._$AH=A):e!==this._$AH&&e!==k&&this._(e):e._$litType$===void 0?e.nodeType===void 0?fe(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==A&&T(this._$AH)?this._$AA.nextSibling.data=e:this.T(C.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=we.createElement(Se(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new Te(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=xe.get(e.strings);return t===void 0&&xe.set(e.strings,t=new we(e)),t}k(t){de(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(w()),this.O(w()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=oe(e).nextSibling;oe(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},N=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=A,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=A}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=M(this,e,t,0),a=!T(e)||e!==this._$AH&&e!==k,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=M(this,r[n+o],t,o),s===k&&(s=this._$AH[o]),a||=!T(s)||s!==this._$AH[o],s===A?e=A:e!==A&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},De=class extends N{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===A?void 0:e}},Oe=class extends N{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==A)}},ke=class extends N{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=M(this,e,t,0)??A)===k)return;let n=this._$AH,r=e===A&&n!==A||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==A&&(n===A||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ae=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){M(this,e)}};const je={M:ce,P:S,A:le,C:1,L:Ce,R:Te,D:fe,V:M,I:Ee,H:N,N:Oe,U:ke,B:De,F:Ae},Me=ae.litHtmlPolyfillSupport;Me?.(we,Ee),(ae.litHtmlVersions??=[]).push(`3.3.2`);const Ne=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new Ee(t.insertBefore(w(),e),e,void 0,n??{})}return i._$AI(e),i},Pe=globalThis
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
;var P=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ne(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return k}};P._$litElement$=!0,P.finalized=!0,Pe.litElementHydrateSupport?.({LitElement:P});const Fe=Pe.litElementPolyfillSupport;Fe?.({LitElement:P}),(Pe.litElementVersions??=[]).push(`4.2.2`);
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const Ie=e=>(t,n)=>{n===void 0?customElements.define(e,t):n.addInitializer(()=>{customElements.define(e,t)})},Le={attribute:!0,type:String,converter:ne,reflect:!1,hasChanged:re},Re=(e=Le,t,n)=>{
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function ze(e){return(t,n)=>typeof n==`object`?Re(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/function F(e){return ze({...e,state:!0,attribute:!1})}
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const I={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},L=e=>(...t)=>({_$litDirective$:e,values:t});var R=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};
/**
* @license
* Copyright 2018 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/const z=L(class extends R{constructor(e){if(super(e),e.type!==I.ATTRIBUTE||e.name!==`class`||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return` `+Object.keys(e).filter(t=>e[t]).join(` `)+` `}update(e,[t]){if(this.st===void 0){this.st=new Set,e.strings!==void 0&&(this.nt=new Set(e.strings.join(` `).split(/\s/).filter(e=>e!==``)));for(let e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}let n=e.element.classList;for(let e of this.st)e in t||(n.remove(e),this.st.delete(e));for(let e in t){let r=!!t[e];r===this.st.has(e)||this.nt?.has(e)||(r?(n.add(e),this.st.add(e)):(n.remove(e),this.st.delete(e)))}return k}}),{I:Be}=je,Ve=e=>e.strings===void 0,He={},Ue=(e,t=He)=>e._$AH=t,We=L(class extends R{constructor(){
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
super(...arguments),this.key=A}render(e,t){return this.key=e,t}update(e,[t,n]){return t!==this.key&&(Ue(e),this.key=t),n}}),B=L(class extends R{constructor(e){
/**
* @license
* Copyright 2018 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
if(super(e),e.type!==I.ATTRIBUTE||e.name!==`style`||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{let r=e[n];return r==null?t:t+`${n=n.includes(`-`)?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,`-$&`).toLowerCase()}:${r};`},``)}update(e,[t]){let{style:n}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let e of this.ft)t[e]??(this.ft.delete(e),e.includes(`-`)?n.removeProperty(e):n[e]=null);for(let e in t){let r=t[e];if(r!=null){this.ft.add(e);let t=typeof r==`string`&&r.endsWith(` !important`);e.includes(`-`)||t?n.setProperty(e,t?r.slice(0,-11):r,t?`important`:``):n[e]=r}}return k}}),Ge=`wl-austria-fonts`;function Ke(){if(typeof document>`u`||document.getElementById(Ge))return;let e=document.createElement(`style`);e.id=Ge,e.textContent=`
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
`,document.head.appendChild(e)}var qe=t({common:()=>Je,default:()=>Qe,flap:()=>Ze,modern:()=>Ye,retro:()=>Xe}),Je={editor:{add_chip:`Chip hinzufügen`,add_icon:`Symbol hinzufügen`,date_format_placeholder:`d.m.Y`,direction_label:`Fahrtrichtung`,direction_not_served:`nicht bedient`,direction_note_one_way:`Rückfahrt deaktiviert: {line} endet hier.`,direction_unavailable:`Keine Abfahrten in dieser Richtung`,entities:`Haltestellen`,entity:`Haltestelle`,header_amenities:`Symbole in diesem Slot`,header_bar_aria:`Stationsanzeige — Seite wählen`,header_chips_and_icons:`Textchips (max. {chips}) und Extra-Symbole (max. {icons})`,header_left:`Linke Seite`,header_pick_side_hint:`Seite antippen, dann unten füllen`,header_right:`Rechte Seite`,header_side_aria:`Seite der Stationsanzeige`,header_slot_empty:`leer`,line_active_aria:`Linie {line} aktiv`,line_inactive_aria:`Linie {line} inaktiv`,lines_empty_means_all:`leer = alle Linien`,lines_label:`Linien an dieser Haltestelle`,lines_selected:`{n} von {total}`,no_lines_hint:`Die Linien erscheinen, sobald diese Haltestelle Abfahrten meldet.`,no_lines_title:`Noch keine Linien verfügbar`,per_line_direction_aria:`Linie {line}: {direction}`,remove_chip_aria:`Chip {chip} entfernen`,remove_icon_aria:`Symbol {icon} entfernen`,remove_stop:`Haltestelle entfernen`,section_board:`Fallblatt-Tafel`,section_departure_row:`Abfahrtszeile`,section_extras:`Extras`,section_extras_hint:`optional`,section_footer:`Fußzeile`,section_header:`Stationsanzeige`,section_header_hint:`Direkt am Balken`,section_led_panel:`LED-Anzeige`,section_station:`Stationsband`,section_walk_time:`Gehzeit zur Haltestelle`,show_clock_short:`Uhr`,show_date_short:`Datum`,show_elevator_short:`Lift`,show_escalator_short:`Rolltreppe`,show_wc_short:`WC`,size_medium:`Mittel`,size_regular:`Standard`,size_small:`Klein`,tab_display:`Anzeige`,tab_stop:`Haltestelle`,tab_stops:`Haltestellen`,tab_tweaks:`Stil`,text_placeholder:`z. B. Name der nächsten Station`,walk_time_aria:`Gehzeit in Minuten für Linie {line} Richtung {towards}`,walk_time_branching_hint:`Gilt für alle Endstationen in dieser Richtung`,walk_time_hint:`Blendet Abfahrten aus, die ohne dich abfahren würden. Leer = kein Filter.`,walk_time_less_aria:`Gehzeit für Linie {line} verringern`,walk_time_more_aria:`Gehzeit für Linie {line} erhöhen`,walk_time_placeholder:`–`,walk_time_unit:`Minuten`}},Ye={no_data:`Keine Abfahrten verfügbar`,betriebsschluss:`Betriebsschluss`,stale_feed:`Keine aktuellen Daten`,stale_feed_detail:`Die Wiener Linien melden für diese Haltestelle veraltete Abfahrtszeiten. Sobald wieder Echtzeitdaten kommen, füllt sich die Anzeige automatisch.`,stale_feed_since:`Letzte gemeldete Abfahrt: {time}`,stale_feed_partial:`Einzelne Linien melden keine aktuellen Zeiten.`,min:`Min`,now:`Jetzt`,platform_short_rail:`Gleis`,platform_short_bus:`Steig`,version_update:`Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.`,entity_missing:`Sensor {entity} existiert nicht mehr. Wähle einen anderen Sensor oder entferne ihn aus den Haltestellen dieser Karte.`,no_entities_picked:`Keine Haltestelle ausgewählt`,no_entities_available:`Keine Wiener-Linien-Sensoren gefunden`,departures_list:`Kommende Abfahrten`,barrier_free_title:`Barrierefrei zugänglich`,cooling_title:`Klimatisiert`,disturbance_title:`Verkehrsbehinderung gemeldet`,stops_ahead_aria_show:`Streckenverlauf für {line} Richtung {towards} anzeigen`,stops_ahead_aria_hide:`Streckenverlauf für {line} Richtung {towards} ausblenden`,stops_ahead_other_show:`{count} weitere Linien bei {stop} anzeigen`,stops_ahead_other_hide:`Weitere Linien bei {stop} ausblenden`,dir_h:`Hinfahrt`,dir_r:`Rückfahrt`,dir_h_short:`H`,dir_r_short:`R`,dir_both:`Beide`,traffic_label:`Störung`,traffic_until:`Bis`,traffic_updated:`aktualisiert`,elevator_until:`Bis`,open_in_maps:`In Karte öffnen`,qr_open:`QR-Code anzeigen`,qr_dialog_title:`QR-Code für Haltestelle`,qr_dialog_hint:`Mit dem Smartphone scannen — öffnet die Haltestelle in der Karten-App.`,qr_dialog_close:`QR-Code schließen`,delay_singular:`1 Min. verspätet`,delay_plural:`{n} Min. verspätet`,devmode_title:`DEV`,devmode_traffic_btn:`Störung testen`,devmode_elevator_btn:`Aufzug testen`,devmode_colors_btn:`Linienfarben`,devmode_clear_btn:`Löschen`,editor:{accessibility_only:`Nur barrierefreie Abfahrten anzeigen`,accessibility_only_requires:`Braucht „Barrierefrei-Symbol anzeigen“.`,colors_empty_hint:`Wähle im ersten Reiter Haltestellen aus — ihre Linien erscheinen dann hier.`,colors_hint:`Optional. Ohne Überschreibung gilt die offizielle Linienfarbe.`,hide_attribution:`Datenquelle ausblenden`,hide_attribution_helper:`Wenn aktiv, wird die Quellenangabe ausgeblendet.`,hide_header:`Kopfzeile ausblenden`,hide_header_helper:`Wenn aktiv, wird die Titelleiste der Karte ausgeblendet.`,layout:`Layout mehrerer Haltestellen`,layout_requires:`Wirkt erst ab zwei Haltestellen.`,layout_stacked:`Gestapelt`,layout_tabs:`Reiter`,max_departures:`Anzahl Abfahrten pro Haltestelle`,pick_color_for_line:`Farbe für Linie {line} wählen`,reset_color:`Auf Standard zurücksetzen`,reset_color_aria:`Linienfarbe {line} auf Standard zurücksetzen`,section_colors:`Linienfarben`,section_colors_hint:`überschreibt API-Farbe`,section_departure_row_hint:`pro Zeile`,section_disruptions:`Störungen & Verspätungen`,section_layout:`Aufbau`,section_layout_hint:`Struktur`,show_accessibility:`Barrierefrei-Symbol anzeigen`,show_cooling:`Klimaanlagen-Symbol anzeigen`,show_cooling_helper:`Zeigt eine Schneeflocke neben Abfahrten mit klimatisiertem Fahrzeug. Wiener Linien melden das pro Fahrzeug — ältere Garnituren liefern die Angabe nicht.`,show_delay:`Verspätungen anzeigen`,show_delay_colors:`Verspätungen farblich hervorheben`,show_delay_colors_helper:`Färbt die Minutenzahl rot, wenn eine Abfahrt verspätet ist, und grün, wenn sie zu früh kommt.`,show_delay_colors_requires:`Braucht „Verspätungen anzeigen“.`,show_departures:`Abfahrtsliste anzeigen`,show_elevator_info:`Aufzugsausfälle anzeigen`,show_hero_metric:`Nächste Abfahrt groß anzeigen`,show_platform:`Gleis/Steig anzeigen`,show_qr_button:`QR-Code-Schaltfläche anzeigen`,show_stops_ahead:`Zwischenstationen anzeigen`,show_traffic_info:`Störungen anzeigen`,show_type_icon:`Verkehrsmittel-Symbol anzeigen`}},Xe={editor:{accessibility_only:`Nur barrierefreie Abfahrten anzeigen`,chips:`Zusätzliche Beschriftungen`,date_format:`Datumsformat`,exit:`Ausgangssymbol`,extra_icons:`Zusätzliche Symbole`,flicker:`LED-Flackern simulieren`,header_exit_accessible:`Stufenloser Ausgang`,header_exit_none:`Kein`,header_exit_regular:`Ausgang`,housing:`LED-Gehäuserahmen anzeigen`,housing_helper:`Dunkler Rahmen um die LED-Anzeige mit dezentem Glas-Reflex obenauf.`,icon_mdi_door_open:`Offene Tür`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_stairs:`Treppe`,line_stripe:`Seitlichen Linienstreifen anzeigen`,line_stripe_helper:`4-Pixel-Balken am linken Rand jeder Zeile in der Linienfarbe.`,message_text:`Nachricht`,message_text_requires:`Braucht „Lauftext anzeigen“.`,message_ticker:`Laufschrift`,message_ticker_helper:`Zeigt alle 5 Minuten eine eigene Nachricht als Laufschrift über die Anzeige.`,platform_side:`Gleis/Steig-Seite`,platform_side_auto:`Automatisch (1 = rechts, 2 = links)`,platform_side_helper:`Standard folgt der Wiener-Linien-Beschilderung (Gleis 2 links, sonst rechts). Manuell überschreibbar.`,platform_side_left:`Immer links`,platform_side_requires:`Braucht „Steig anzeigen“.`,platform_side_right:`Immer rechts`,show_clock:`Uhr-Plakette anzeigen`,show_date:`Datums-Plakette anzeigen`,show_header:`Stationsanzeige anzeigen`,show_header_helper:`Hauptschalter. Einstellungen pro Seite bleiben gespeichert.`,show_line_pill:`Linien-Plakette anzeigen`,show_line_pill_helper:`Liniencode als gefüllte Plakette in der Linienfarbe statt als schlichter Text.`,show_platform:`Steig anzeigen`,show_station_name:`Stationsnamen anzeigen`,show_unit:`Einheit „min“ anzeigen`,show_unit_helper:`Kleines „min“ in Amber-Versalien nach jeder Minutenzahl.`,size:`Größe`,station_bg:`Stationsschild-Hintergrund`,station_bg_black:`Schwarz`,station_bg_default:`Standard`,station_bg_white:`Weiß`,style:`Stil`,style_classic:`Klassisch`,style_pixel:`Punktmatrix`,style_warm:`Warm`,text:`Beschriftung`,wheelchair_race:`Rollstuhl-Rennen (Easter Egg)`},aria_dismiss_message:`Lauftext schließen`,aria_start_race:`Barrierefreiheits-Rennen starten`,at_platform:`Einfahrt`,barrier_free_title:`Barrierefrei zugänglich`,betriebsschluss:`Betriebsschluss`,countdown_minutes:`{n} Minuten`,departures_list:`Kommende Abfahrten`,dir_both:`Beide`,dir_h:`Hinfahrt`,dir_h_short:`H`,dir_r:`Rückfahrt`,dir_r_short:`R`,entity_missing:`Sensor {entity} existiert nicht mehr. Wähle oben einen anderen Sensor.`,gleis:`GLEIS`,header:{icon_exit:`Ausgang`,icon_exit_access:`Stufenloser Ausgang`,icon_wc:`WC`,icon_escalator:`Rolltreppe`,icon_elevator:`Aufzug`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_door_open:`Offene Tür`,icon_mdi_stairs:`Treppe`},no_data:`Keine Abfahrten`,no_data_wrong_direction:`Keine Abfahrten in dieser Richtung`,no_data_wrong_line:`Keine Abfahrten für diese Linie`,no_entity:`Keine Haltestelle ausgewählt`,race_finished:`Barrierefreiheits-Rennen beendet`,race_starting_in:`Rennen startet in {n}`,race_winner_announce:`Rollstuhl {n} gewinnt das Barrierefreiheits-Rennen`,stale_feed:`Keine aktuellen Daten`,steig:`STEIG`,unit_min:`min`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.`,version_update:`Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden`,via_prefix:`ÜBER`},Ze={no_entity:`Keine Haltestelle ausgewählt`,no_data:`Keine Abfahrten`,no_data_wrong_direction:`Keine Abfahrten in dieser Richtung`,no_data_wrong_line:`Keine Abfahrten für diese Linie`,betriebsschluss:`Betriebsschluss`,stale_feed:`Keine aktuellen Daten`,dir_h:`Hinfahrt`,dir_r:`Rückfahrt`,dir_h_short:`H`,dir_r_short:`R`,gleis:`GLEIS`,steig:`STEIG`,col_line:`LINIE`,col_dest:`RICHTUNG`,col_step_free:`STUFENLOS`,col_cd:`ANKUNFT`,version_update:`Klappanzeige wurde auf v{v} aktualisiert — bitte neu laden`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.`,entity_missing:`Sensor {entity} existiert nicht mehr. Wähle oben einen anderen Sensor.`,departures_list:`Kommende Abfahrten`,at_platform:`Einfahrt`,countdown_minutes:`{n} Minuten`,barrier_free_title:`Barrierefrei zugänglich`,not_barrier_free_title:`Nicht barrierefrei`,unit_min:`min`,dir_both:`Beide`,header:{icon_exit:`Ausgang`,icon_exit_access:`Stufenloser Ausgang`,icon_wc:`WC`,icon_escalator:`Rolltreppe`,icon_elevator:`Aufzug`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_door_open:`Offene Tür`,icon_mdi_stairs:`Treppe`},editor:{accessibility_only:`Nur barrierefreie Abfahrten anzeigen`,accessibility_only_requires:`Braucht „Rollstuhl-Plakette anzeigen“.`,chips:`Zusätzliche Beschriftungen`,date_format:`Datumsformat`,exit:`Ausgangssymbol`,extra_icons:`Zusätzliche Symbole`,header_exit_accessible:`Stufenloser Ausgang`,header_exit_none:`Kein`,header_exit_regular:`Ausgang`,hide_attribution:`Datenquelle ausblenden`,hide_attribution_helper:`Wenn aktiv, wird die CC-BY-Quellenangabe am unteren Rand der Karte ausgeblendet. Die OGD-Lizenz der Wiener Linien verlangt eine sichtbare Quellenangabe, sofern der Hinweis nicht an anderer Stelle im Dashboard erscheint.`,housing:`Gehäuserahmen anzeigen`,housing_helper:`Umrahmt die Tafel mit dem Gehäuse inkl. dezenter Innenkante und Schlagschatten. Gehäusefarbe folgt dem HA-Theme (cremefarben im Hellmodus, dunkel im Dunkelmodus). Aus = Tafel sitzt bündig auf dem Dashboard.`,icon_mdi_door_open:`Offene Tür`,icon_mdi_exit_run:`Ausgang (laufende Person)`,icon_mdi_exit_to_app:`Ausgang (Tür)`,icon_mdi_stairs:`Treppe`,max_rows:`Anzahl Zeilen`,max_rows_helper:`Wie viele Abfahrten die Tafel zeigt (1–8). Über alle Haltestellen zusammengeführt, nach Abfahrtszeit sortiert.`,show_accessibility:`Rollstuhl-Plakette anzeigen`,show_accessibility_helper:`Zeigt eine Rollstuhl-Plakette neben barrierefreien Abfahrten.`,show_clock:`Uhr-Plakette anzeigen`,show_date:`Datums-Plakette anzeigen`,show_header:`Stationsanzeige anzeigen`,show_header_helper:`Hauptschalter. Einstellungen pro Seite bleiben gespeichert.`,show_line_column:`Linienspalte anzeigen`,show_line_column_helper:`Zeigt die Spalte mit dem Liniencode. Ausschalten, wenn die Tafel ohnehin nur eine Linie zeigt.`,show_min_unit:`Einheit „min“ anzeigen`,show_min_unit_helper:`Kleines „min“ neben der Minutenzahl, wie auf echten Stationstafeln.`,show_platform:`Gleis/Steig anzeigen`,show_platform_helper:`Fügt jeder Zeile eine eigene Gleis-Plakette zwischen Ziel und Minutenzahl hinzu. Wird nur eingeblendet, wenn mindestens eine sichtbare Zeile einen Gleis-Wert hat.`,show_station_name:`Stationsnamen anzeigen`,show_station_name_helper:`Farbiges Band mit Stationsname und Uhrzeit am oberen Rand der Karte.`,size:`Größe`,station_bg:`Hintergrund Stationsschild`,station_bg_black:`Schwarz`,station_bg_helper:`Standard ist die Farbe der ersten erfassten Linie (z. B. Rot für U1, Orange für U3). Bei mehreren Linien kann eine bestimmte Linie gewählt oder auf Weiß bzw. Schwarz umgestellt werden.`,station_bg_line:`Erste Linie`,station_bg_white:`Weiß`,text:`Beschriftung`}},Qe={common:Je,modern:Ye,retro:Xe,flap:Ze},$e=t({common:()=>et,default:()=>it,flap:()=>rt,modern:()=>tt,retro:()=>nt}),et={editor:{add_chip:`Add chip`,add_icon:`Add icon`,date_format_placeholder:`d.m.Y`,direction_label:`Direction`,direction_not_served:`not served`,direction_note_one_way:`Return direction disabled: {line} terminates here.`,direction_unavailable:`No departures in this direction`,entities:`Stops`,entity:`Stop`,header_amenities:`Icons in this slot`,header_bar_aria:`Station sign — choose a side`,header_chips_and_icons:`Text chips (max. {chips}) and extra icons (max. {icons})`,header_left:`Left side`,header_pick_side_hint:`Tap a side, then fill it in below`,header_right:`Right side`,header_side_aria:`Station sign side`,header_slot_empty:`empty`,line_active_aria:`Line {line} active`,line_inactive_aria:`Line {line} inactive`,lines_empty_means_all:`empty = all lines`,lines_label:`Lines at this stop`,lines_selected:`{n} of {total}`,no_lines_hint:`Lines appear as soon as this stop reports departures.`,no_lines_title:`No lines yet`,per_line_direction_aria:`Line {line}: {direction}`,remove_chip_aria:`Remove chip {chip}`,remove_icon_aria:`Remove icon {icon}`,remove_stop:`Remove stop`,section_board:`Split-flap board`,section_departure_row:`Departure row`,section_extras:`Extras`,section_extras_hint:`optional`,section_footer:`Footer`,section_header:`Station sign`,section_header_hint:`Edit on the bar`,section_led_panel:`LED panel`,section_station:`Station band`,section_walk_time:`Walking time to the stop`,show_clock_short:`Clock`,show_date_short:`Date`,show_elevator_short:`Elevator`,show_escalator_short:`Escalator`,show_wc_short:`WC`,size_medium:`Medium`,size_regular:`Standard`,size_small:`Small`,tab_display:`Display`,tab_stop:`Stop`,tab_stops:`Stops`,tab_tweaks:`Style`,text_placeholder:`e.g. name of the next station`,walk_time_aria:`Walking time in minutes for line {line} towards {towards}`,walk_time_branching_hint:`Applies to every terminus in this direction`,walk_time_hint:`Hides departures that would leave without you. Empty = no filter.`,walk_time_less_aria:`Decrease walking time for line {line}`,walk_time_more_aria:`Increase walking time for line {line}`,walk_time_placeholder:`–`,walk_time_unit:`minutes`}},tt={no_data:`No departures available`,betriebsschluss:`End of service`,stale_feed:`No live data`,stale_feed_detail:`Wiener Linien is sending out-of-date departure times for this stop. Departures return automatically once live data resumes.`,stale_feed_since:`Last reported departure: {time}`,stale_feed_partial:`Some lines aren't reporting current times.`,min:`min`,now:`Now`,platform_short_rail:`Track`,platform_short_bus:`Bay`,version_update:`Wiener Linien Austria updated to v{v} — please reload`,version_reload:`Reload`,version_reload_stuck:`Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.`,entity_missing:`Sensor {entity} no longer exists. Pick a different sensor, or remove it from this card's stops.`,no_entities_picked:`No stop selected`,no_entities_available:`No Wiener Linien sensors found`,departures_list:`Upcoming departures`,barrier_free_title:`Step-free access`,cooling_title:`Air conditioned`,disturbance_title:`Traffic disruption reported`,stops_ahead_aria_show:`Show stops ahead for {line} towards {towards}`,stops_ahead_aria_hide:`Hide stops ahead for {line} towards {towards}`,stops_ahead_other_show:`Show {count} more lines at {stop}`,stops_ahead_other_hide:`Hide other lines at {stop}`,dir_h:`Outbound`,dir_r:`Return`,dir_h_short:`H`,dir_r_short:`R`,dir_both:`Both`,traffic_label:`Disruption`,traffic_until:`Until`,traffic_updated:`updated`,elevator_until:`Until`,open_in_maps:`Open in maps`,qr_open:`Show QR code`,qr_dialog_title:`QR code for stop`,qr_dialog_hint:`Scan with your phone — opens the stop in your maps app.`,qr_dialog_close:`Close QR code`,delay_singular:`1 min. late`,delay_plural:`{n} min. late`,devmode_title:`DEV`,devmode_traffic_btn:`Test disruption`,devmode_elevator_btn:`Test elevator`,devmode_colors_btn:`Line colours`,devmode_clear_btn:`Clear`,editor:{accessibility_only:`Only show step-free departures`,accessibility_only_requires:`Requires “Show accessibility icon”.`,colors_empty_hint:`Pick stops on the Stops tab — their lines will show up here.`,colors_hint:`Optional. Without an override the official line colour applies.`,hide_attribution:`Hide data source`,hide_attribution_helper:`When on, the data-source credit is hidden.`,hide_header:`Hide header`,hide_header_helper:`When on, the card title bar is hidden.`,layout:`Multi-stop layout`,layout_requires:`Only takes effect with two or more stops.`,layout_stacked:`Stacked`,layout_tabs:`Tabs`,max_departures:`Departures per stop`,pick_color_for_line:`Pick colour for line {line}`,reset_color:`Reset to default`,reset_color_aria:`Reset line colour {line} to default`,section_colors:`Line colours`,section_colors_hint:`overrides the API colour`,section_departure_row_hint:`per row`,section_disruptions:`Disruptions & delays`,section_layout:`Structure`,section_layout_hint:`Layout`,show_accessibility:`Show step-free icon`,show_cooling:`Show air-conditioning icon`,show_cooling_helper:`Shows a snowflake beside departures with an air-conditioned vehicle. Wiener Linien report this per vehicle — older trains and trams don't send it.`,show_delay:`Show delays`,show_delay_colors:`Colour-code delays`,show_delay_colors_helper:`Turns the countdown number red when a departure runs late and green when it runs early.`,show_delay_colors_requires:`Requires “Show delays”.`,show_departures:`Show departure list`,show_elevator_info:`Show elevator outages`,show_hero_metric:`Show next departure large`,show_platform:`Show platform / track`,show_qr_button:`Show QR-code button`,show_stops_ahead:`Show intermediate stops`,show_traffic_info:`Show disruption alerts`,show_type_icon:`Show vehicle-type icon`}},nt={editor:{accessibility_only:`Only show step-free departures`,chips:`Extra labels`,date_format:`Date format`,exit:`Exit icon`,extra_icons:`Extra icons`,flicker:`Simulate LED flicker`,header_exit_accessible:`Step-free exit`,header_exit_none:`None`,header_exit_regular:`Exit`,housing:`Show LED cabinet frame`,housing_helper:`Dark bezel around the LED panel with a subtle glass reflection on top.`,icon_mdi_door_open:`Open door`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_stairs:`Stairs`,line_stripe:`Show line stripe`,line_stripe_helper:`A 4 px coloured bar at the left edge of each row, matched to the line.`,message_text:`Message`,message_text_requires:`Requires “Show ticker”.`,message_ticker:`Scrolling message`,message_ticker_helper:`Runs a custom message across the display every 5 minutes.`,platform_side:`Platform side`,platform_side_auto:`Auto (1 = right, 2 = left)`,platform_side_helper:`Default follows Wiener Linien signage (platform 2 on the left, otherwise right). Override manually if needed.`,platform_side_left:`Always left`,platform_side_requires:`Requires “Show platform”.`,platform_side_right:`Always right`,show_clock:`Show clock chip`,show_date:`Show date chip`,show_header:`Show station sign`,show_header_helper:`Master switch. Per-side settings are kept.`,show_line_pill:`Show line badge`,show_line_pill_helper:`Renders the line code as a filled badge in the line colour rather than plain text.`,show_platform:`Show platform`,show_station_name:`Show station name`,show_unit:`Show the “min” unit`,show_unit_helper:`Trail each countdown number with a small amber "min" caption.`,size:`Size`,station_bg:`Station-name background`,station_bg_black:`Black`,station_bg_default:`Default`,station_bg_white:`White`,style:`Style`,style_classic:`Classic`,style_pixel:`Dot matrix`,style_warm:`Warm`,text:`Sign text`,wheelchair_race:`Wheelchair race (easter egg)`},aria_dismiss_message:`Dismiss scrolling message`,aria_start_race:`Start accessibility race`,at_platform:`Arriving`,barrier_free_title:`Step-free access`,betriebsschluss:`End of service`,countdown_minutes:`{n} minutes`,departures_list:`Upcoming departures`,dir_both:`Both`,dir_h:`Outbound`,dir_h_short:`H`,dir_r:`Return`,dir_r_short:`R`,entity_missing:`Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.`,gleis:`PLATF.`,header:{icon_exit:`Exit`,icon_exit_access:`Step-free exit`,icon_wc:`Toilet`,icon_escalator:`Escalator`,icon_elevator:`Elevator`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_door_open:`Open door`,icon_mdi_stairs:`Stairs`},no_data:`No departures`,no_data_wrong_direction:`No departures in this direction`,no_data_wrong_line:`No departures for this line`,no_entity:`No stop selected`,race_finished:`Accessibility race finished`,race_starting_in:`Race starting in {n}`,race_winner_announce:`Wheelchair {n} wins the accessibility race`,stale_feed:`No live data`,steig:`BAY`,unit_min:`min`,version_reload:`Reload`,version_reload_stuck:`Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.`,version_update:`Retro card updated to v{v} — please reload`,via_prefix:`VIA`},rt={no_entity:`No stop selected`,no_data:`No departures`,no_data_wrong_direction:`No departures in this direction`,no_data_wrong_line:`No departures for this line`,betriebsschluss:`End of service`,stale_feed:`No live data`,dir_h:`Outbound`,dir_r:`Return`,dir_h_short:`H`,dir_r_short:`R`,gleis:`PLATF.`,steig:`BAY`,col_line:`LINE`,col_dest:`DIRECTION`,col_step_free:`STEP-FREE`,col_cd:`ARRIVAL`,version_update:`Flap card updated to v{v} — please reload`,version_reload:`Reload`,version_reload_stuck:`Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.`,entity_missing:`Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.`,departures_list:`Upcoming departures`,at_platform:`Arriving`,countdown_minutes:`{n} minutes`,barrier_free_title:`Step-free access`,not_barrier_free_title:`Step-free access not available`,unit_min:`min`,dir_both:`Both`,header:{icon_exit:`Exit`,icon_exit_access:`Step-free exit`,icon_wc:`Toilet`,icon_escalator:`Escalator`,icon_elevator:`Elevator`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_door_open:`Open door`,icon_mdi_stairs:`Stairs`},editor:{accessibility_only:`Only show step-free departures`,accessibility_only_requires:`Requires “Show wheelchair badge”.`,chips:`Extra labels`,date_format:`Date format`,exit:`Exit icon`,extra_icons:`Extra icons`,header_exit_accessible:`Step-free exit`,header_exit_none:`None`,header_exit_regular:`Exit`,hide_attribution:`Hide data source`,hide_attribution_helper:`When on, the CC-BY credit at the bottom of the card is hidden. The Wiener Linien Open Government Data licence requires visible attribution unless you keep the credit elsewhere on the dashboard.`,housing:`Show cabinet frame`,housing_helper:`Wraps the board in the cabinet with a soft inset bevel and drop shadow. Cabinet colour follows your HA theme (cream on light, dark on dark). When off, the board sits flush against the dashboard.`,icon_mdi_door_open:`Open door`,icon_mdi_exit_run:`Exit (running person)`,icon_mdi_exit_to_app:`Exit (door)`,icon_mdi_stairs:`Stairs`,max_rows:`Number of rows`,max_rows_helper:`How many departures to show on the board (1–8). Merged across all stops, sorted by countdown.`,show_accessibility:`Show step-free tile`,show_accessibility_helper:`Add a wheelchair pictogram tile next to step-free departures.`,show_clock:`Show clock chip`,show_date:`Show date chip`,show_header:`Show station sign`,show_header_helper:`Master switch. Per-side settings are kept.`,show_line_column:`Show line column`,show_line_column_helper:`Shows the column carrying the line code. Turn it off when the board only ever shows one line.`,show_min_unit:`Show "min" caption`,show_min_unit_helper:`Small label next to the countdown number, like real station boards.`,show_platform:`Show platform / track`,show_platform_helper:`Adds a per-row platform tile between the destination and the countdown. Only shown when at least one visible row has a platform value.`,show_station_name:`Show station name`,show_station_name_helper:`Coloured band with the station name and current time at the top of the card.`,size:`Size`,station_bg:`Station-name background`,station_bg_black:`Black`,station_bg_helper:`Default is the colour of the first tracked line (e.g. red for U1, orange for U3). On multi-line boards you can pick a specific line, or override with solid white or black.`,station_bg_line:`First line`,station_bg_white:`White`,text:`Sign text`}},it={common:et,modern:tt,retro:nt,flap:rt};const at={de:qe,en:$e},ot=at.de??{};function st(e,t){return e.split(`.`).reduce((e,t)=>{if(e&&typeof e==`object`&&t in e)return e[t]},t)}function ct(e,t){let n=st(e,t);return typeof n==`string`?n:void 0}function lt(e){return((e.configLanguage||e.hassLanguage||`de`).split(/[-_]/)[0]??`de`)===`en`?`en`:`de`}function V(e,t,n){let r=lt(t),i=ct(e,at[r]??ot);if(i===void 0&&(i=ct(e,ot)),i===void 0)return e;if(n)for(let[e,t]of Object.entries(n))i=i.replace(`{${e}}`,String(t));return i}async function ut(e,t,n){if(!e?.callWS)return null;try{let r=await e.callWS({type:t});if(r?.version&&r.version!==n)return r.version}catch{}return null}function dt(e){try{window.caches?.keys?.().then(e=>{e.forEach(e=>window.caches?.delete?.(e))})}catch{}if(e)try{window.sessionStorage?.setItem(`wl-reload-attempted-${e}`,`1`)}catch{}window.location.reload()}function ft(e){if(!e)return!1;try{return window.sessionStorage?.getItem(`wl-reload-attempted-${e}`)===`1`}catch{return!1}}function pt(e,t,n=`banner`){if(!e)return A;if(ft(e)){let e=t(`version_reload_stuck`);return O`
      <div class=${n} role="alert" aria-live="assertive">
        <span>${e}</span>
      </div>
    `}let r=t(`version_update`).replace(`{v}`,e),i=t(`version_reload`);return O`
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
  `}const mt=c`:host {
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
}`,ht=c`:host {
--wl-sunken: color-mix(in srgb, var(--primary-text-color) 3%, var(--card-background-color));
--wl-hover: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
--wl-ripple: color-mix(in srgb, var(--primary-color) 14%, transparent);
}`,gt=c`:host {
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
}`;function _t(e,t){let n={hassLanguage:t};return{t:t=>V(`${e}.${t}`,n),et:t=>{let r=`${e}.editor.${t}`,i=V(r,n);if(i!==r)return i;let a=`common.editor.${t}`,o=V(a,n);return o===a?t:o}}}function vt(e,t,n){let r=(t,r)=>{let i=t.key===`ArrowRight`?1:t.key===`ArrowLeft`?-1:0;if(!i)return;t.preventDefault();let a=(r+i+e.length)%e.length,o=e[a];if(!o)return;n(o.key);let s=t.currentTarget.parentElement?.children[a];s instanceof HTMLElement&&s.focus()};return O`
    <div class="wl-tabs" role="tablist">
      ${e.map((e,i)=>O`<button
          type="button"
          class="wl-tab"
          role="tab"
          id=${`wl-tab-${e.key}`}
          aria-selected=${t===e.key?`true`:`false`}
          aria-controls=${t===e.key?`wl-panel-${e.key}`:A}
          tabindex=${t===e.key?`0`:`-1`}
          @click=${()=>n(e.key)}
          @keydown=${e=>r(e,i)}
        >
          <span class="wl-tab-label">${e.label}</span>
          <span class="wl-tab-underline" aria-hidden="true"></span>
        </button>`)}
    </div>
  `}function yt(e,t){return O`
    <div
      class=${e===`stops`?`wl-panel wl-panel--stops`:`wl-panel`}
      role="tabpanel"
      id=${`wl-panel-${e}`}
      aria-labelledby=${`wl-tab-${e}`}
    >
      ${t}
    </div>
  `}function bt(e,t){return O`
    <section class="wl-section">
      <header class="wl-section-header">
        <span class="wl-section-title">${e.title}</span>
        ${e.hint?O`<span class="wl-section-hint">${e.hint}</span>`:A}
      </header>
      <div class="wl-section-body">${t}</div>
    </section>
  `}function H(e){return bt(e,O`<ha-form
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
*/const xt=L(class extends R{constructor(e){if(super(e),e.type!==I.PROPERTY&&e.type!==I.ATTRIBUTE&&e.type!==I.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!Ve(e))throw Error("`live` bindings can only contain a single expression")}render(e){return e}update(e,[t]){if(t===k||t===A)return t;let n=e.element,r=e.name;if(e.type===I.PROPERTY){if(t===n[r])return k}else if(e.type===I.BOOLEAN_ATTRIBUTE){if(!!t===n.hasAttribute(r))return k}else if(e.type===I.ATTRIBUTE&&n.getAttribute(r)===t+``)return k;return Ue(e),t}}),U={exit:{kind:`svg`,viewBox:`0 0 36.29 29.04`,glyphPointsTo:`left`,labelKey:`icon_exit`,shapes:()=>be`
      <polygon points="31.29 0 18.99 0 13.99 0 13.99 5 13.99 10.31 18.99 10.31 18.99 5 31.29 5 31.29 24.04 18.99 24.04 18.99 18.44 13.99 18.44 13.99 24.04 13.99 29.04 18.99 29.04 31.29 29.04 36.29 29.04 36.29 24.04 36.29 5 36.29 0 31.29 0"/>
      <polygon points="24.22 12.38 7.65 12.38 12.5 7.53 6.85 7.53 0 14.37 6.85 21.23 12.51 21.23 12.51 21.23 7.66 16.38 24.22 16.38 24.22 12.38"/>
    `},"exit-access":{kind:`svg`,viewBox:`0 0 36.29 29.04`,glyphPointsTo:`right`,labelKey:`icon_exit_access`,shapes:()=>be`
      <polygon points="17.3 18.73 17.3 24.04 5 24.04 5 5 17.3 5 17.3 10.59 22.3 10.59 22.3 5 22.3 0 17.3 0 5 0 0 0 0 5 0 24.04 0 29.04 5 29.04 17.3 29.04 22.3 29.04 22.3 24.04 22.3 18.73 17.3 18.73"/>
      <circle cx="9.97" cy="8.73" r="1.05"/>
      <path d="M9.04,10.69h0v4.12h0c0,.36.5.66,1.12.66h3.48l1.2,2.87h1l-1.2-2.87-.39-.93h-2.97v-1.47h2.32s-.09-.68-.58-.68h-1.74v-1.7h0c0-.36-.5-.66-1.12-.66s-1.12.29-1.12.66Z"/>
      <path d="M11.67,18.74c1.04-.58,1.78-1.63,1.91-2.87h-.72c-.18,1.49-1.45,2.64-2.98,2.64-1.66,0-3.01-1.35-3.01-3.01,0-1.21.71-2.24,1.74-2.72v-.77c-1.43.52-2.45,1.89-2.45,3.49,0,2.05,1.67,3.72,3.72,3.72h6.32v-.48h-4.53Z"/>
      <polygon points="29.44 7.81 23.79 7.81 23.79 7.81 28.63 12.66 17.3 12.66 17.3 16.66 28.64 16.66 23.79 21.51 29.45 21.51 36.29 14.66 29.44 7.81"/>
    `},wc:{kind:`text`,text:`WC`,labelKey:`icon_wc`},escalator:{kind:`svg`,viewBox:`0 0 36.74 28.3`,labelKey:`icon_escalator`,shapes:()=>be`
      <polygon points="27.05 0 27.05 3.08 23.69 3.08 23.69 6.17 20.32 6.17 20.32 9.25 16.96 9.25 16.96 12.33 13.64 12.33 13.64 15.42 10.28 15.42 10.28 18.5 6.91 18.5 6.91 22.14 0 22.14 0 28.3 7.97 28.3 30.42 6.17 36.74 6.17 36.74 0 27.05 0"/>
    `},elevator:{kind:`svg`,viewBox:`0 0 24.01 36.69`,labelKey:`icon_elevator`,shapes:()=>be`
      <path d="M14.82,19.29h-5.63c-.37,0-.68.3-.68.68v5.15c0,.37.3.68.68.68s.68-.3.68-.68v-4.48h.42v12.32c0,.37.3.68.68.68s.68-.3.68-.68v-7.42h.73v7.42c0,.37.3.68.68.68s.68-.3.68-.68v-12.32h.42v4.48c0,.37.3.68.68.68s.68-.3.68-.68v-5.15c0-.37-.3-.68-.68-.68Z"/>
      <circle cx="12" cy="17.3" r="1.57"/>
      <path d="M22.6,14.1v21.18H1.41V14.1h21.18M24.01,12.68H0v24.01h24.01V12.68h0Z"/>
      <polygon points="11.11 4.94 6.17 0 1.23 4.94 1.23 7.6 5.23 3.61 5.23 11.48 7.11 11.48 7.11 3.61 11.11 7.6 11.11 4.94"/>
      <polygon points="12.9 6.54 17.84 11.48 22.78 6.54 22.78 3.87 18.78 7.87 18.78 0 16.9 0 16.9 7.87 12.9 3.87 12.9 6.54"/>
    `}},St=[`mdi:exit-run`,`mdi:exit-to-app`,`mdi:door-open`,`mdi:stairs`],Ct={"mdi:exit-run":{labelKey:`icon_mdi_exit_run`,glyphPointsTo:`right`},"mdi:exit-to-app":{labelKey:`icon_mdi_exit_to_app`,glyphPointsTo:`right`},"mdi:door-open":{labelKey:`icon_mdi_door_open`},"mdi:stairs":{labelKey:`icon_mdi_stairs`}};function wt(e){return typeof e==`string`&&e in Ct}function Tt(e,t){let n=U[e];if(n.kind===`text`)return O`<span class="retro-station-header__tile" role="img" aria-label=${t.ariaLabel}>
      <span class="retro-station-header__monogram" aria-hidden="true">${n.text}</span>
    </span>`;let r=t.flipX?`retro-station-header__icon retro-station-header__icon--flip-x`:`retro-station-header__icon`;return O`<span class="retro-station-header__tile" role="img" aria-label=${t.ariaLabel}>
    <svg
      class=${r}
      viewBox=${n.viewBox}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >${n.shapes()}</svg>
  </span>`}function Et(e,t){let n=t.flipX?`retro-station-header__mdi retro-station-header__mdi--flip-x`:`retro-station-header__mdi`;return O`<span class="retro-station-header__tile retro-station-header__tile--mdi" role="img" aria-label=${t.ariaLabel}>
    <ha-icon class=${n} icon=${e}></ha-icon>
  </span>`}function Dt(e,t){return O`<span class="retro-station-header__tile retro-station-header__tile--mdi" role="img" aria-label=${t}>
    <ha-icon class="retro-station-header__mdi" icon=${e}></ha-icon>
  </span>`}function W(e){e.key!==`Escape`&&e.key!==`Tab`&&e.stopPropagation()}function Ot(e,t){let n=e.trim(),r=n===``?NaN:Number(n);return n!==``&&!Number.isFinite(r)&&console.warn(`[wiener-linien-austria] walk-time "${e}" for ${t} is not a number — clearing`),Number.isFinite(r)&&r>0?Math.min(120,Math.round(r)):null}function kt(e){if(e?.themes?.darkMode===!0)return`dark`;if(e?.themes?.darkMode===!1)return`light`}const At=e=>Math.min(1,Math.max(0,e)),G=e=>e<=.04045?e/12.92:((e+.055)/1.055)**2.4,jt=e=>e<=.0031308?e*12.92:1.055*e**(1/2.4)-.055;function Mt(e){let t=e.trim();if(!t||t.includes(`var(`))return null;let n=/^#[0-9a-f]{3,8}$/i.test(t)?t.slice(1):``;if(!n){let e=``;try{let n=document.createElement(`span`).style;n.color=t,e=n.color.trim()}catch{return null}let n=/^rgba?\(([^)]+)\)$/.exec(e);if(!n?.[1])return null;let[r,i,a]=n[1].split(/[,\s/]+/).filter(Boolean).map(Number);return r===void 0||i===void 0||a===void 0||![r,i,a].every(Number.isFinite)?null:[G(r/255),G(i/255),G(a/255)]}if((n.length===3||n.length===4)&&(n=[...n.slice(0,3)].map(e=>e+e).join(``)),n.length!==6&&n.length!==8)return null;let r=Number.parseInt(n.slice(0,6),16);return Number.isFinite(r)?[G((r>>16&255)/255),G((r>>8&255)/255),G((r&255)/255)]:null}function Nt([e,t,n]){let r=Math.cbrt(.4122214708*e+.5363325363*t+.0514459929*n),i=Math.cbrt(.2119034982*e+.6806995451*t+.1073969566*n),a=Math.cbrt(.0883024619*e+.2817188376*t+.6299787005*n);return[.2104542553*r+.793617785*i-.0040720468*a,1.9779984951*r-2.428592205*i+.4505937099*a,.0259040371*r+.7827717662*i-.808675766*a]}function Pt([e,t,n]){let r=(e+.3963377774*t+.2158037573*n)**3,i=(e-.1055613458*t-.0638541728*n)**3,a=(e-.0894841775*t-1.291485548*n)**3;return[4.0767416621*r-3.3077115913*i+.2309699292*a,-1.2684380046*r+2.6097574011*i-.3413193965*a,-.0041960863*r-.7034186147*i+1.707614701*a]}const Ft=([e,t,n])=>`#`+[e,t,n].map(e=>Math.round(At(jt(e))*255).toString(16).padStart(2,`0`)).join(``);function It(e,t){if(t===void 0)return null;let n=Mt(e);if(!n)return null;let[r,i,a]=Nt(n),o=t===`dark`?Math.max(.72,r):Math.min(.45,r);if(o===r)return Ft(n);let s=Math.hypot(i,a),c=Math.atan2(a,i),l=Pt([o,s*Math.cos(c),s*Math.sin(c)]);return Ft([At(l[0]),At(l[1]),At(l[2])])}const K={show_station_name:{retro:!1,flap:!0},housing:{retro:!1,flap:!0},size:{retro:`regular`,flap:`small`},unit_caption:{retro:!1,flap:!0},station_bg:{retro:`default`,flap:`line`},show_platform:{retro:!0,flap:!0}},Lt={LB:`WLB`,"25BR":`25B`};function Rt(e){return Lt[e]??e}const zt=new Set([`none`,`regular`,`accessible`,...St]);function Bt(e,t,n){if(typeof e!=`string`)return;let r=n?e.trim().slice(0,t):e.slice(0,t);return r.length>0?r:void 0}function Vt(e,t){if(!Array.isArray(e))return;let{maxCount:n,truncateTo:r,accept:i}=t,a=e.filter(e=>typeof e==`string`).map(e=>r===void 0?e.trim():e.trim().slice(0,r)).filter(e=>e.length>0&&(i===void 0||i(e))).slice(0,n);return a.length>0?a:void 0}const Ht=/^[a-z0-9_-]+:[a-z0-9_-]+$/i;function Ut(e){if(!e||typeof e!=`object`)return;let t=e,n={},r=zt.has(t.exit)?t.exit:`none`;r!==`none`&&(n.exit=r);let i=Bt(t.text,64,!0);i!==void 0&&(n.text=i),t.show_wc===!0&&(n.show_wc=!0),t.show_escalator===!0&&(n.show_escalator=!0),t.show_elevator===!0&&(n.show_elevator=!0),t.show_clock===!0&&(n.show_clock=!0),t.show_date===!0&&(n.show_date=!0);let a=Vt(t.chips,{truncateTo:16,maxCount:6});a!==void 0&&(n.chips=a);let o=Vt(t.extra_icons,{maxCount:3,accept:e=>Ht.test(e)&&e.length<=64});if(o!==void 0&&(n.extra_icons=o),Object.keys(n).length===0)return;let s=Bt(t.date_format,32,!1);return s!==void 0&&(n.date_format=s),n}function Wt(e,t){let n={};if(!e||typeof e!=`object`)return n;for(let[r,i]of Object.entries(e))t.has(r)||(n[r]=i);return n}function Gt(e){if(!e||typeof e!=`object`)return;let t={};for(let[n,r]of Object.entries(e)){let e=typeof r==`number`?r:typeof r==`string`?Number(r):NaN;if(!Number.isFinite(e)||e<0||e>120){console.warn(`[wiener-linien-austria] walk_times["${n}"] = ${JSON.stringify(r)} is not a finite number in 0..120 — dropping`);continue}let i=n.split(`|`),a=i.length>=3?`${i[0]}|${i[1]}`:n,o=Math.round(e),s=t[a];t[a]=s===void 0?o:Math.max(s,o)}return Object.keys(t).length?t:void 0}function Kt(e){if(!e||typeof e!=`object`)return;let t={};for(let[n,r]of Object.entries(e)){if(typeof n!=`string`||!n.length)continue;let e=n.toUpperCase();if(r===`H`||r===`R`){t[e]=r;continue}r!==void 0&&r!==``&&r!==`Both`&&console.warn(`[wiener-linien-austria] line_directions["${n}"] = ${JSON.stringify(r)} is not "H" / "R" / "Both" — dropping`)}return Object.keys(t).length?t:void 0}function qt(e,t,n={},r=`var(--primary-color)`){let i=e.toUpperCase();if(t[i]!==void 0)return{background:t[i]};if(/^N\d/.test(i))return{background:`#1b1464`,color:`#fef200`};let a=n[e]??n[i];return a?.bg?a.fg?{background:`#${a.bg}`,color:`#${a.fg}`}:{background:`#${a.bg}`}:{background:r}}function Jt(e,t,n={},r,i=`var(--primary-color)`){let a=qt(e,t,n,i);return{fill:a.background,ink:a.color,text:It(a.background,r)??void 0}}const Yt=[{key:`show_wc`,icon:`mdi:human-male-female`,labelKey:`show_wc_short`},{key:`show_escalator`,icon:`mdi:escalator`,labelKey:`show_escalator_short`},{key:`show_elevator`,icon:`mdi:elevator`,labelKey:`show_elevator_short`},{key:`show_clock`,icon:`mdi:clock-outline`,labelKey:`show_clock_short`},{key:`show_date`,icon:`mdi:calendar`,labelKey:`show_date_short`}],Xt=[{value:`regular`,icon:`mdi:exit-run`,labelKey:`header_exit_regular`},{value:`accessible`,icon:`mdi:wheelchair-accessibility`,labelKey:`header_exit_accessible`},...St.map(e=>({value:e,icon:e,labelKey:Ct[e].labelKey})),{value:`none`,icon:`mdi:close-circle-outline`,labelKey:`header_exit_none`}];function Zt(e,t,n){let r=[];if(!e)return[{label:t,kind:`text`,name:t}];if(e.exit&&e.exit!==`none`){let t=Xt.find(t=>t.value===e.exit);r.push({label:``,icon:t?.icon??e.exit,kind:`icon`,name:t?n(t.labelKey):e.exit})}e.text&&r.push({label:e.text,kind:`text`,name:e.text});for(let t of Yt)e[t.key]&&r.push({label:``,icon:t.icon,kind:`icon`,name:n(t.labelKey)});for(let t of e.extra_icons??[])r.push({label:``,icon:t,kind:`icon`,name:t});for(let t of e.chips??[])r.push({label:t,kind:`chip`,name:t});return r.length||r.push({label:t,kind:`text`,name:t}),r}function Qt(e,t){let n=(e.selected===`header_left`?e.left:e.right)??{},r=e.et(`header_slot_empty`),i=(n,r)=>t.patch(e.selected,n,r);return O`
    <div class="wl-strip">
      <div class="wl-strip-bar" role="group" aria-label=${e.et(`header_bar_aria`)}>
        ${$t(`header_left`,e,t,r)}
        ${$t(`header_right`,e,t,r)}
      </div>

      <div class="wl-strip-switch">
        <span class="wl-note wl-label--grow">${e.et(`header_pick_side_hint`)}</span>
        <div class="wl-seg" role="group" aria-label=${e.et(`header_side_aria`)}>
          ${[`header_left`,`header_right`].map(n=>O`<button
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
            ${Xt.map(t=>{let r=(n.exit??`none`)===t.value,a=e.et(t.labelKey);return O`<button
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
            @keydown=${W}
            @keyup=${W}
            @keypress=${W}
            @change=${e=>i(`text`,e.target.value.trim()||void 0)}
          />
        </div>

        <div class="wl-group">
          <span class="wl-label">${e.et(`header_amenities`)}</span>
          <div class="wl-tray">
            ${Yt.map(t=>{let r=!!n[t.key],a=e.et(t.labelKey);return O`<button
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
          ${n.show_date?O`<input
                type="text"
                class="wl-text"
                maxlength=${32}
                .value=${n.date_format??``}
                aria-label=${e.et(`date_format`)}
                placeholder=${e.et(`date_format_placeholder`)}
                @keydown=${W}
                @keyup=${W}
                @keypress=${W}
                @change=${e=>i(`date_format`,e.target.value.trim()||void 0)}
              />`:A}
        </div>

        ${en(n,e,i)}
      </div>
    </div>
  `}function $t(e,t,n,r){let i=e===`header_left`?t.left:t.right,a=t.selected===e,o=Zt(i,r,t.et),s=t.et(e===`header_left`?`header_left`:`header_right`);return O`<button
    type="button"
    class=${z({"wl-zone":!0,"wl-zone--selected":a,"wl-zone--right":e===`header_right`})}
    aria-pressed=${a?`true`:`false`}
    aria-label=${`${s}: ${o.map(e=>e.name).join(`, `)}`}
    @click=${()=>n.selectSide(e)}
  >
    <span class="wl-zone-tokens">
      ${o.map(e=>O`<span
          class=${z({"wl-token":!0,"wl-token--chip":e.kind===`chip`})}
          >${e.icon?O`<ha-icon icon=${e.icon} aria-hidden="true"></ha-icon>`:e.label}</span
        >`)}
    </span>
  </button>`}function en(e,t,n){let r=e.chips??[],i=e.extra_icons??[];return O`
    <div class="wl-group">
      <span class="wl-label"
        >${t.et(`header_chips_and_icons`).replace(`{chips}`,`6`).replace(`{icons}`,`3`)}</span
      >
      <div class="wl-tray">
        ${i.map((e,r)=>O`<span class="wl-pill">
            <ha-icon icon=${e} aria-hidden="true"></ha-icon>
            <button
              type="button"
              class="wl-pill-x"
              aria-label=${t.et(`remove_icon_aria`).replace(`{icon}`,e)}
              @click=${()=>n(`extra_icons`,tn(i,r))}
            >
              <ha-icon icon="mdi:close" aria-hidden="true"></ha-icon>
            </button>
          </span>`)}
        ${r.map((e,i)=>O`<span class="wl-pill">
            ${e}
            <button
              type="button"
              class="wl-pill-x"
              aria-label=${t.et(`remove_chip_aria`).replace(`{chip}`,e)}
              @click=${()=>n(`chips`,tn(r,i))}
            >
              <ha-icon icon="mdi:close" aria-hidden="true"></ha-icon>
            </button>
          </span>`)}
      </div>

      ${i.length<3?O`<ha-icon-picker
            .value=${xt(``)}
            .label=${t.et(`add_icon`)}
            @value-changed=${e=>{let t=e.detail?.value;t&&n(`extra_icons`,[...i,t].slice(0,3))}}
          ></ha-icon-picker>`:A}
      ${r.length<6?O`<input
            type="text"
            class="wl-text"
            maxlength=${16}
            aria-label=${t.et(`add_chip`)}
            placeholder=${t.et(`add_chip`)}
            @keydown=${e=>{if(W(e),e.key!==`Enter`)return;let t=e.target,i=t.value.trim();i&&(n(`chips`,[...r,i].slice(0,6)),t.value=``)}}
            @keyup=${W}
            @keypress=${W}
          />`:A}
    </div>
  `}function tn(e,t){let n=e.filter((e,n)=>n!==t);return n.length?n:void 0}function nn(e,t){return`${e}|${t}`}function rn(e){let t=[],n=new Set;for(let r of e?.departures??[]){let e=String(r.direction??``),i=`${r.line}|${e}|${r.towards}`;n.has(i)||(n.add(i),t.push({line:r.line,direction:e,towards:r.towards,type:r.type}))}return t.sort((e,t)=>e.line===t.line?e.towards.localeCompare(t.towards):e.line.localeCompare(t.line)),t}function an(e){let t=new Map;for(let n of e?.departures??[]){let e=String(n.direction??``),r=nn(n.line,e),i=t.get(r);i||(i={line:n.line,direction:e,type:n.type,termini:[]},t.set(r,i)),n.towards&&!i.termini.includes(n.towards)&&i.termini.push(n.towards)}let n=Array.from(t.values());return n.sort((e,t)=>e.line===t.line?e.direction.localeCompare(t.direction):e.line.localeCompare(t.line)),n}function on(e,t){if(!e.length)return t.full;let n=e.slice(0,3).join(` / `),r=e.length>3?` +${e.length-3}`:``;return`${t.short}: ${n}${r}`}function sn(e,t){let n=new Set;for(let r of e?.tracked_line_keys??[]){let[e,i]=r.split(`|`,2);t&&e!==t||(i===`H`||i===`R`)&&n.add(i)}if(n.size===0)for(let r of e?.departures??[])t&&r.line!==t||(r.direction===`H`||r.direction===`R`)&&n.add(r.direction);let r=[...n];return{available:n,unknown:n.size===0,oneWay:n.size===1?r[0]??null:null}}function cn(e,t){if(t.size===0)return[...e];let n=e.filter(e=>t.has(e));for(let e of t)n.includes(e)||n.push(e);return n}function ln(e){if(e?.tracked_lines?.length)return[...e.tracked_lines].sort();let t=new Set;if(e?.lines_at_stop?.length)for(let n of e.lines_at_stop)t.add(n);for(let n of e?.departures??[])n.line&&t.add(n.line);return Array.from(t).sort()}function un(e,t){let{lines:n,direction:r,line_directions:i,walk_times:a,accessibility_only:o}=t,s=n&&n.length?new Set(n.map(Rt)):null;return e.filter(e=>{if(s&&!s.has(e.line))return!1;let t=i?.[e.line]??r;if(t&&e.direction!==t)return!1;if(a){let t=a[nn(e.line,String(e.direction??``))];if(typeof t==`number`&&e.countdown<t)return!1}return!(o&&!e.barrier_free)})}function dn(e,t){let{lines:n,picked:r,lineDirections:i,stopDirection:a}=t,o=e=>i[e]??a,s=an(e).filter(e=>{if(r.size>0&&!r.has(e.line))return!1;let t=o(e.line);return!t||e.direction===t}),c=new Set(s.map(e=>e.line)),l=cn(n,r),u=[];for(let e of l){if(c.has(e))continue;let t=o(e);for(let n of t?[t]:[`H`,`R`])u.push({line:e,direction:n,type:``,termini:[]})}return[...s,...u].sort((e,t)=>e.line===t.line?e.direction.localeCompare(t.direction):e.line.localeCompare(t.line))}const fn=`ptMetro`;function pn(e){switch(e){case fn:return`mdi:subway-variant`;case`ptTram`:return`mdi:tram`;case`ptBusCity`:case`ptBusNight`:return`mdi:bus`;default:return null}}function mn(e){return{"--wl-chip-color":e.fill,...e.text?{"--wl-chip-text":e.text}:{},...e.ink?{"--wl-chip-ink":e.ink}:{}}}function hn(e){return{background:e.fill,...e.ink?{"--wl-chip-ink":e.ink}:{}}}function gn(e,t){return e?.states?.[t]?.attributes}function _n(e,t,n){let r=new Set;for(let i of e)i.direction===t&&(n&&i.line!==n||i.towards&&r.add(i.towards));return[...r].sort()}function vn(e,t){return!e.singleLine&&cn(t.lines,t.picked).length>=2}function yn(e,t,n,r){let i=gn(e,t.entity),a=!i,o=i?.stop_name||t.entity,s=i?.line_colors??{},c=kt(e),l=e=>Jt(e,n.lineColorOverrides,s,c,`#5b6470`),u=new Set(t.lines??[]),d=ln(i),f=u.size?[...new Set([...d,...u])].sort():d,p=rn(i),m=new Map;for(let e of i?.departures??[])e.line&&e.type&&!m.has(e.line)&&m.set(e.line,e.type);let h=e=>({full:n.t(e===`H`?`dir_h`:`dir_r`),short:n.t(e===`H`?`dir_h_short`:`dir_r_short`)});return O`
    <section class="wl-section">
      <header class="wl-section-header">
        ${n.total>1?O`<span class="wl-index" aria-hidden="true">${n.index}</span>`:A}
        <span class="wl-section-title">${o}</span>
      </header>
      <div class="wl-stop-body">
        ${a?bn(t,n,r):A}
        ${xn(t,n,r,{lines:f,picked:u,colorOf:l,typeByLine:m})}
        ${!a&&f.length?vn(n,{lines:f,picked:u})?Cn(t,n,r,{attrs:i,triplets:p,picked:u,lines:f,colorOf:l,dirStrings:h}):Sn(t,n,r,{attrs:i,triplets:p,picked:u,lines:f,dirStrings:h}):A}
        ${a?A:wn(t,n,r,{attrs:i,picked:u,colorOf:l,lines:f,dirStrings:h})}
      </div>
    </section>
  `}function bn(e,t,n){return O`
    <ha-alert alert-type="error">
      ${t.t(`entity_missing`).replace(`{entity}`,e.entity)}
      ${n.remove?O`<button
            type="button"
            slot="action"
            class="wl-add"
            @click=${()=>n.remove?.(e.entity)}
          >
            ${t.et(`remove_stop`)}
          </button>`:A}
    </ha-alert>
  `}function xn(e,t,n,r){let{lines:i,picked:a,colorOf:o,typeByLine:s}=r,c=a.size?t.et(`lines_selected`).replace(`{n}`,String(a.size)).replace(`{total}`,String(i.length)):t.et(`lines_empty_means_all`);return O`
    <div class="wl-group">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${t.et(`lines_label`)}</span>
        ${i.length?O`<span class="wl-note">${c}</span>`:A}
      </div>
      ${i.length?O`<div class="wl-chips">
            ${i.map(r=>{let i=t.singleLine?a.has(r):a.size===0||a.has(r),c=pn(s.get(r));return O`<button
                type="button"
                class="wl-chip"
                style=${B(mn(o(r)))}
                aria-pressed=${i?`true`:`false`}
                aria-label=${t.et(i?`line_active_aria`:`line_inactive_aria`).replace(`{line}`,r)}
                @click=${()=>n.toggleLine(e.entity,r)}
              >
                ${c?O`<span class="wl-chip-mode"
                      ><ha-icon icon=${c} aria-hidden="true"></ha-icon
                    ></span>`:A}
                ${r}
              </button>`})}
          </div>`:O`<div class="wl-empty">
            <span class="wl-empty-title">${t.et(`no_lines_title`)}</span>
            <span class="wl-note">${t.et(`no_lines_hint`)}</span>
          </div>`}
    </div>
  `}function Sn(e,t,n,r){let{attrs:i,triplets:a,picked:o,lines:s,dirStrings:c}=r,l=cn(s,o),u=l.length===1?l[0]:void 0,d=e.direction??null,f=sn(i,u),p=f.available.has(`H`),m=f.available.has(`R`),h=f.oneWay!==null,g=d===`H`||d===null&&f.oneWay===`H`,_=d===`R`||d===null&&f.oneWay===`R`,v=d===null&&!h,ee=t=>{let r={};for(let[t,n]of Object.entries(e.line_directions??{}))l.includes(t)||(r[t]=n);n.setDirections(e.entity,{direction:t,lineDirections:r})},te=e=>f.unknown||f.available.has(e)?on(_n(a,e,u),c(e)):`${c(e).short}: ${t.et(`direction_not_served`)}`,y=f.oneWay!==null&&l.length===1?t.et(`direction_note_one_way`).replace(`{line}`,l[0]??``):``;return O`
    <div class="wl-group">
      <span class="wl-label">${t.et(`direction_label`)}</span>
      <div class="wl-dirs">
        ${q({label:te(`H`),active:g,disabled:!f.unknown&&!p,title:p||f.unknown?t.t(`dir_h`):t.et(`direction_unavailable`),onClick:()=>ee(`H`)})}
        ${q({label:te(`R`),active:_,disabled:!f.unknown&&!m,title:m||f.unknown?t.t(`dir_r`):t.et(`direction_unavailable`),onClick:()=>ee(`R`)})}
        ${t.singleLine?A:q({label:t.t(`dir_both`),active:v,disabled:h,title:h?t.et(`direction_unavailable`):t.t(`dir_both`),onClick:()=>ee(null)})}
      </div>
      ${y?O`<span class="wl-note">${y}</span>`:A}
    </div>
  `}function q(e){return O`<button
    type="button"
    class=${z({"wl-dir":!0,"wl-dir--compact":!!e.compact})}
    aria-pressed=${e.active?`true`:`false`}
    aria-disabled=${e.disabled?`true`:`false`}
    aria-label=${e.ariaLabel??e.label}
    title=${e.title}
    @click=${t=>{if(e.disabled){t.preventDefault();return}e.onClick()}}
  >
    ${e.icon?O`<ha-icon icon=${e.icon} aria-hidden="true"></ha-icon>`:e.label}
  </button>`}function Cn(e,t,n,r){let{attrs:i,triplets:a,picked:o,lines:s,colorOf:c,dirStrings:l}=r,u=cn(s,o),d=e.line_directions??{},f=e.direction??null,p=e=>d[e]??f,m=(t,r)=>{let i={};for(let e of u){let n=e===t?r:p(e);n&&(i[e]=n)}for(let[e,t]of Object.entries(d))u.includes(e)||(i[e]=t);n.setDirections(e.entity,{direction:null,lineDirections:i})};return O`
    <div class="wl-group">
      <span class="wl-label">${t.et(`direction_label`)}</span>
      ${u.map(e=>{let n=sn(i,e),r=p(e),o=n.available.has(`H`),s=n.available.has(`R`),u=n.oneWay!==null,d=n.unknown,f=n=>t.et(`per_line_direction_aria`).replace(`{line}`,e).replace(`{direction}`,n===null?t.t(`dir_both`):on(_n(a,n,e),l(n)));return O`
          <div class="wl-override-row">
            <span class="wl-badge" style=${B(hn(c(e)))}
              >${e}</span
            >
            <div class="wl-dirs">
              ${q({label:l(`H`).short,active:r===`H`||r===null&&n.oneWay===`H`,disabled:!d&&!o,compact:!0,title:_n(a,`H`,e).join(` / `)||t.t(`dir_h`),ariaLabel:f(`H`),onClick:()=>m(e,`H`)})}
              ${q({label:l(`R`).short,active:r===`R`||r===null&&n.oneWay===`R`,disabled:!d&&!s,compact:!0,title:_n(a,`R`,e).join(` / `)||t.t(`dir_r`),ariaLabel:f(`R`),onClick:()=>m(e,`R`)})}
              ${q({label:``,icon:`mdi:swap-horizontal`,active:r===null&&!u,disabled:u,compact:!0,title:t.t(`dir_both`),ariaLabel:f(null),onClick:()=>m(e,null)})}
            </div>
          </div>
        `})}
    </div>
  `}function wn(e,t,n,r){let{attrs:i,picked:a,colorOf:o,lines:s,dirStrings:c}=r,l=dn(i,{lines:s,picked:a,lineDirections:e.line_directions??{},stopDirection:e.direction??null});return l.length?O`
    <div class="wl-group wl-divide">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${t.et(`section_walk_time`)}</span>
        <span class="wl-note">${t.et(`walk_time_unit`)}</span>
      </div>
      <span class="wl-note">${t.et(`walk_time_hint`)}</span>
      <div class="wl-walk-list">
        ${l.map(r=>{let i=nn(r.line,r.direction),a=e.walk_times?.[i],s=r.termini.length?r.termini.join(` / `):r.direction===`H`||r.direction===`R`?c(r.direction).full:``,l=t.et(`walk_time_aria`).replace(`{line}`,r.line).replace(`{towards}`,s),u=t=>{let r=(a??0)+t;n.setWalkTime(e.entity,i,r<1?null:Math.min(120,r))};return O`
            <div class="wl-walk-row">
              <span class="wl-badge" style=${B(hn(o(r.line)))}
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
                  .value=${xt(a===void 0?``:String(a))}
                  @keydown=${W}
                  @keyup=${W}
                  @keypress=${W}
                  @change=${t=>n.setWalkTime(e.entity,i,Ot(t.target.value,`${e.entity}/${i}`))}
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
  `:A}function Tn(e,t){let n=(n,r)=>{let i=e();i&&t(i.map(e=>e.entity===n?r({...e}):e))};return{toggleLine:(e,t)=>n(e,e=>{let n=new Set(e.lines??[]);return n.has(t)?n.delete(t):n.add(t),n.size?e.lines=[...n]:delete e.lines,e}),setDirections:(e,t)=>n(e,e=>(t.direction===null?delete e.direction:e.direction=t.direction,Object.keys(t.lineDirections).length?e.line_directions=t.lineDirections:delete e.line_directions,e)),setWalkTime:(e,t,r)=>n(e,e=>{let n={...e.walk_times??{}};return r===null?delete n[t]:n[t]=r,Object.keys(n).length?e.walk_times=n:delete e.walk_times,e}),remove:n=>{let r=e();r&&t(r.filter(e=>e.entity!==n))}}}function En(e,t){let n=Array.isArray(t)?t.filter(e=>typeof e==`string`&&e.length>0):[],r=new Map(e.map(e=>[e.entity,e]));return n.map(e=>r.get(e)??{entity:e})}function Dn(e,t,n){let r={...e??{},[t]:n};return n===void 0&&delete r[t],r}function On(e,t,n){let r=t.et(n);return r===n?e?.localize?.(`ui.panel.lovelace.editor.card.generic.${n}`)||n:r}function kn(e,t,n){let r=n?.[t];if(r!==void 0)return r;let i=`${t}_helper`,a=e.et(i);return a===i?void 0:a}function An(e,t,n){e.dispatchEvent(new CustomEvent(t,{detail:n,bubbles:!0,composed:!0}))}const jn=new Set([`small`,`medium`,`regular`]),Mn=new Set([`line`,`white`,`black`]);function Nn(e){return typeof e==`string`&&(Mn.has(e)||e.startsWith(`line:`)&&e.length>5)?e:K.station_bg.flap}function Pn(e,t){return typeof e==`boolean`?e:t}function Fn(e){if(typeof e==`string`)return e.startsWith(`sensor.`)?{entity:e}:null;if(!e||typeof e!=`object`)return null;let t=e,n=typeof t.entity==`string`?t.entity:null;if(!n?.startsWith(`sensor.`))return null;let r={entity:n};if(Array.isArray(t.lines)){let e=t.lines.filter(e=>typeof e==`string`&&e.length>0).map(Rt);e.length&&(r.lines=e)}(t.direction===`H`||t.direction===`R`)&&(r.direction=t.direction);let i=Kt(t.line_directions);i&&(r.line_directions=i);let a=Gt(t.walk_times);return a&&(r.walk_times=a),r}const In=new Set([`type`,`entities`,`entity`,`line`,`lines`,`direction`,`walk_times`,`size`,`max_rows`,`show_platform`,`show_station_name`,`show_station_header`,`station_bg`,`show_min_unit`,`show_accessibility`,`accessibility_only`,`show_header`,`header_left`,`header_right`,`hide_attribution`,`show_line_column`,`line_pill`,`housing`]);function J(e){let t=jn.has(e.size)?e.size:K.size.flap,n=Number(e.max_rows),r=Number.isFinite(n);e.max_rows!==void 0&&!r&&console.warn(`[wiener-linien-austria-flap-card] max_rows ${JSON.stringify(e.max_rows)} is not a number — falling back to 2`);let i=r?Math.max(1,Math.min(8,Math.round(n))):2,a=[];if(Array.isArray(e.entities))a=e.entities;else if(typeof e.entity==`string`){let t;Array.isArray(e.lines)?t=e.lines.filter(e=>typeof e==`string`&&e.length>0):typeof e.line==`string`&&e.line&&(t=[e.line]),a=[{entity:e.entity,...t&&t.length?{lines:t}:{},...e.direction===void 0?{}:{direction:e.direction},...e.walk_times===void 0?{}:{walk_times:e.walk_times}}]}let o=[],s=new Set;for(let e of a){let t=Fn(e);if(!t){console.warn(`[wiener-linien-austria-flap-card] dropping malformed stop entry`,e);continue}s.has(t.entity)||(s.add(t.entity),o.push(t))}let c=Wt(e,In),l=Nn(e.station_bg),u=e.show_station_header,d=typeof e.show_station_name==`boolean`?e.show_station_name:typeof u==`boolean`?u:K.show_station_name.flap;return{...c,type:e.type||`custom:wiener-linien-austria-flap-card`,entities:o,size:t,max_rows:i,show_platform:Pn(e.show_platform,K.show_platform.flap),show_station_name:d,station_bg:l,show_min_unit:Pn(e.show_min_unit,K.unit_caption.flap),show_accessibility:Pn(e.show_accessibility,!0),accessibility_only:e.accessibility_only===!0,show_header:e.show_header===!0,header_left:Ut(e.header_left),header_right:Ut(e.header_right),hide_attribution:e.hide_attribution===!0,show_line_column:e.show_line_column===void 0?e.line_pill!==!0:e.show_line_column===!0,housing:Pn(e.housing,K.housing.flap)}}function Y(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}let X=class extends P{constructor(...e){super(...e),this._tab=`stops`,this._headerSide=`header_left`,this._onEntitiesChanged=e=>{e.stopPropagation(),this._config&&this._commit(J({...this._config,entities:En(this._config.entities,e.detail.value.entities)}))},this._computeLabel=e=>On(this.hass,this._i18n,e.name),this._computeHelper=e=>{let{et:t}=this._i18n;return kn(this._i18n,e.name,{...this._config?.show_accessibility?{}:{accessibility_only:t(`accessibility_only_requires`)}})}}setConfig(e){if(!e||typeof e!=`object`)throw Error(`wiener-linien-austria-flap-card-editor: config must be an object`);if(e.entity!==void 0&&typeof e.entity!=`string`)throw Error(`wiener-linien-austria-flap-card-editor: 'entity' must be a string`);this._config=J(e)}shouldUpdate(e){if(!this._config)return!1;if(e.has(`_config`)||e.has(`_tab`)||e.has(`_headerSide`))return!0;let t=e.get(`hass`);if(!t||!this.hass)return!0;let n=this._config.entities.map(e=>e.entity);return n.length===0||n.some(e=>t.states[e]!==this.hass.states[e])}get _i18n(){return _t(`flap`,this.hass?.language)}_commit(e){this._config=e,An(this,`config-changed`,{config:e})}_patch(e){this._config&&this._commit(J({...this._config,...e}))}get _stopCallbacks(){return Tn(()=>this._config?.entities,e=>{this._config&&this._commit({...this._config,entities:e})})}render(){if(!this._config)return A;let{et:e}=this._i18n;return O`
      <div class="wl-editor">
        ${vt([{key:`stops`,label:e(`tab_stops`)},{key:`display`,label:e(`tab_display`)},{key:`tweaks`,label:e(`tab_tweaks`)}],this._tab,e=>{this._tab=e})}
        ${yt(this._tab,this._renderActiveTab())}
      </div>
    `}_renderActiveTab(){switch(this._tab){case`stops`:return this._renderStops();case`display`:return this._renderDisplay();case`tweaks`:return this._renderTweaks()}}_renderStops(){let e=this._config,{t,et:n}=this._i18n;return O`
      <ha-form
        .hass=${this.hass}
        .data=${{entities:e.entities.map(e=>e.entity)}}
        .schema=${[{name:`entities`,required:!0,selector:{entity:{multiple:!0,filter:{domain:`sensor`,integration:`wiener_linien_austria`}}}}]}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._onEntitiesChanged}
      ></ha-form>
      ${e.entities.map((r,i)=>yn(this.hass,r,{index:i+1,total:e.entities.length,lineColorOverrides:{},t,et:n},this._stopCallbacks))}
    `}_renderDisplay(){let e=this._config,{et:t}=this._i18n,n={hass:this.hass,computeLabel:this._computeLabel,computeHelper:this._computeHelper,onChange:e=>this._patch(e)};return O`
      ${bt({title:t(`section_header`),hint:t(`section_header_hint`)},O`
          <ha-form
            .hass=${this.hass}
            .data=${{show_header:e.show_header}}
            .schema=${[{name:`show_header`,selector:{boolean:{}}}]}
            .computeLabel=${this._computeLabel}
            .computeHelper=${this._computeHelper}
            @value-changed=${e=>{e.stopPropagation(),this._patch(e.detail.value)}}
          ></ha-form>
          ${e.show_header?Qt({left:e.header_left,right:e.header_right,selected:this._headerSide,et:t},{selectSide:e=>{this._headerSide=e},patch:(e,t,n)=>this._patchHeaderSide(e,t,n)}):A}
        `)}
      ${H({...n,title:t(`section_station`),data:{show_station_name:e.show_station_name,station_bg:e.station_bg},schema:[{name:`show_station_name`,selector:{boolean:{}}},{name:`station_bg`,selector:{select:{mode:`dropdown`,options:this._stationBgOptions()}}}]})}
      ${H({...n,title:t(`section_departure_row`),hint:t(`section_board`),data:{max_rows:e.max_rows,show_platform:e.show_platform,show_accessibility:e.show_accessibility,accessibility_only:e.accessibility_only},schema:[{name:`max_rows`,selector:{number:{min:1,max:8,step:1,mode:`slider`}}},{name:`show_platform`,selector:{boolean:{}}},{name:`show_accessibility`,selector:{boolean:{}}},{name:`accessibility_only`,disabled:!e.show_accessibility,selector:{boolean:{}}}]})}
    `}_renderTweaks(){let e=this._config,{et:t}=this._i18n,n={hass:this.hass,computeLabel:this._computeLabel,computeHelper:this._computeHelper,onChange:e=>this._patch(e)};return O`
      ${H({...n,title:t(`section_board`),data:{size:e.size,show_min_unit:e.show_min_unit,show_line_column:e.show_line_column,housing:e.housing},schema:[{name:`size`,selector:{select:{mode:`dropdown`,options:[{value:`small`,label:t(`size_small`)},{value:`medium`,label:t(`size_medium`)},{value:`regular`,label:t(`size_regular`)}]}}},{name:`show_min_unit`,selector:{boolean:{}}},{name:`show_line_column`,selector:{boolean:{}}},{name:`housing`,selector:{boolean:{}}}]})}
      ${H({...n,title:t(`section_footer`),data:{hide_attribution:e.hide_attribution},schema:[{name:`hide_attribution`,selector:{boolean:{}}}]})}
    `}_patchHeaderSide(e,t,n){this._config&&this._patch({[e]:Dn(this._config[e],t,n)})}_stationBgOptions(){let{et:e}=this._i18n,t=[{value:`line`,label:e(`station_bg_line`)}],n=new Set;for(let e of this._config?.entities??[]){let t=this.hass?.states?.[e.entity]?.attributes,r=e.lines&&e.lines.length>0?e.lines:t?.tracked_lines;for(let e of r??[])typeof e==`string`&&e&&n.add(e)}if(n.size===0){let e=this._config?.entities?.[0]?.entity,t=e?this.hass?.states?.[e]?.attributes?.line_colors:void 0;for(let e of Object.keys(t??{}))n.add(e)}for(let e of[...n].sort())t.push({value:`line:${e}`,label:e});return t.push({value:`white`,label:e(`station_bg_white`)}),t.push({value:`black`,label:e(`station_bg_black`)}),t}static{this.styles=[ht,mt,gt]}};Y([ze({attribute:!1})],X.prototype,`hass`,void 0),Y([F()],X.prototype,`_config`,void 0),Y([F()],X.prototype,`_tab`,void 0),Y([F()],X.prototype,`_headerSide`,void 0),X=Y([Ie(`wiener-linien-austria-flap-card-editor`)],X);function Ln(e){if(!e)return[];let t=[];for(let[n,r]of Object.entries(e.states??{})){if(!n.startsWith(`sensor.`))continue;let e=r?.attributes??{};typeof e.diva==`number`&&Array.isArray(e.departures)&&e.next_by_line&&typeof e.next_by_line==`object`&&t.push(n)}return t.sort(),t}function Rn(e,t){return!e||!t?{}:e.states?.[t]?.attributes?.line_colors??{}}function zn(e,t){if(!e)return{};let n={};for(let r of t)for(let[t,i]of Object.entries(Rn(e,r)))t in n||(n[t]=i);return n}function Bn(e){if(!e)return null;let t=Date.parse(e);if(!Number.isFinite(t))return null;let n=new Date(t);return`${String(n.getHours()).padStart(2,`0`)}:${String(n.getMinutes()).padStart(2,`0`)}`}function Z(e){return String(e).padStart(2,`0`)}function Vn(e,t,n=`de`){if(!t)return``;let r=n===`en`?`en-GB`:`de-AT`,i=()=>e.toLocaleDateString(r,{weekday:`long`}),a=()=>e.toLocaleDateString(r,{weekday:`short`}),o=()=>e.toLocaleDateString(r,{month:`long`}),s=()=>e.toLocaleDateString(r,{month:`short`}),c=``,l=0;for(;l<t.length;){let n=t[l];if(n===`\\`&&l+1<t.length){c+=t[l+1],l+=2;continue}switch(n){case`d`:c+=Z(e.getDate());break;case`j`:c+=String(e.getDate());break;case`D`:c+=a();break;case`l`:c+=i();break;case`m`:c+=Z(e.getMonth()+1);break;case`n`:c+=String(e.getMonth()+1);break;case`M`:c+=s();break;case`F`:c+=o();break;case`Y`:c+=String(e.getFullYear());break;case`y`:c+=Z(e.getFullYear()%100);break;case`H`:c+=Z(e.getHours());break;case`G`:c+=String(e.getHours());break;case`h`:c+=Z((e.getHours()+11)%12+1);break;case`g`:c+=String((e.getHours()+11)%12+1);break;case`i`:c+=Z(e.getMinutes());break;case`s`:c+=Z(e.getSeconds());break;default:c+=n??``}l++}return c}function Hn(e,t,n){if(!e||!t)return null;let r=Date.parse(e);return Number.isFinite(r)?Vn(new Date(r),t,n):null}function Un(e,t,n,r,i){let a=A;if(e.exit===`regular`||e.exit===`accessible`){let n=e.exit===`regular`?`exit`:`exit-access`;a=Tt(n,{ariaLabel:r(`header.${U[n].labelKey}`),flipX:U[n].glyphPointsTo!==t})}else if(e.exit&&wt(e.exit)){let n=Ct[e.exit];a=Et(e.exit,{ariaLabel:r(`header.${n.labelKey}`),flipX:n.glyphPointsTo!==void 0&&n.glyphPointsTo!==t})}let o=e.text?O`<span class="retro-station-header__text">${e.text}</span>`:A,s=e=>Tt(e,{ariaLabel:r(`header.${U[e].labelKey}`)}),c=e.show_wc?s(`wc`):A,l=e.show_escalator?s(`escalator`):A,u=e.show_elevator?s(`elevator`):A,d=(e.extra_icons??[]).map(e=>Dt(e,e)),f=[...d].reverse(),p=(e.chips??[]).map(e=>O`<span class="retro-station-header__chip">${e}</span>`),m=[...p].reverse(),h=e.show_clock?Bn(n):null,g=h?O`<span
        class="retro-station-header__chip retro-station-header__chip--clock"
      >
        <ha-icon
          class="retro-station-header__chip-icon"
          icon="mdi:clock-outline"
        ></ha-icon>
        <span>${h}</span>
      </span>`:A,_=e.show_date?Hn(n,e.date_format??`d.m.Y`,i):null,v=_?O`<span
        class="retro-station-header__chip retro-station-header__chip--date"
        >${_}</span
      >`:A;return t===`left`?O`${a}${o}${u}${l}${c}${d}${p}${v}${g}`:O`${g}${v}${m}${f}${c}${l}${u}${o}${a}`}function Wn(e){let{left:t,right:n,serverTime:r,t:i,lang:a}=e;return!t&&!n?A:O`
    <div class="retro-station-header" role="group">
      <div class="retro-station-header__side retro-station-header__side--left">
        ${t?Un(t,`left`,r,i,a):A}
      </div>
      <div class="retro-station-header__side retro-station-header__side--right">
        ${n?Un(n,`right`,r,i,a):A}
      </div>
    </div>
  `}const Gn=`ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß`,Kn=`0123456789`;function qn(e,t,n){let r=((e.includes(t)?e.indexOf(t):e.length)+1)%(e.length+1);return r===e.length?n:e[r]}function Jn(e,t){if(e===t)return t;let n=Gn.includes(e),r=Kn.includes(e),i=Gn.includes(t),a=Kn.includes(t);return(n||i)&&!r&&!a?qn(Gn,e,t):(r||a)&&!n&&!i?qn(Kn,e,t):t}function Q(e,t){return`row${e}-${t}`}const Yn={small:22,medium:28,regular:32};function Xn(e){let t=typeof e==`number`&&Number.isFinite(e)?e:null;return t===null?`--`:String(t<=0?0:t).padStart(2,` `)}{let e=window;e.customCards=e.customCards??[],e.customCards.some(e=>e.type===`wiener-linien-austria-flap-card`)||e.customCards.push({type:`wiener-linien-austria-flap-card`,name:`Wiener Linien Austria — Flap Board`,description:`Solari-style split-flap departure board`,preview:!0,getEntitySuggestion:(e,t)=>!t.startsWith(`sensor.`)||e?.entities?.[t]?.platform!==`wiener_linien_austria`?null:{config:{type:`custom:wiener-linien-austria-flap-card`,entities:[t]}}})}let $=class extends P{constructor(...e){super(...e),this._versionMismatch=null,this._displayed={},this._target={},this._justFlipped={},this._marchTimer=null,this._versionCheckDone=!1,this._fallbackWarned=!1}setConfig(e){if(!e||typeof e!=`object`)throw Error(`wiener-linien-austria-flap-card: config must be an object`);if(e.entity!==void 0&&typeof e.entity!=`string`)throw Error(`wiener-linien-austria-flap-card: 'entity' must be a string`);let t=J(e);if((Array.isArray(e.entities)?e.entities.length:typeof e.entity==`string`&&e.entity?1:0)>0&&t.entities.length===0)throw Error("wiener-linien-austria-flap-card: every configured entity was rejected (must start with `sensor.`) — see browser console for per-entry details");this._config=t,this._clearFlipTimer(),this._displayed={},this._target={},this._justFlipped={}}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:`auto`,min_columns:6,min_rows:3}}static getConfigElement(){return document.createElement(`wiener-linien-austria-flap-card-editor`)}static getStubConfig(e){let t=Ln(e)[0];if(!t)return{};let n=`H`,r=e?.states?.[t]?.attributes?.departures;if(Array.isArray(r)){let e=r.some(e=>e.direction===`H`),t=r.some(e=>e.direction===`R`);!e&&t&&(n=`R`)}return{entity:t,direction:n}}connectedCallback(){super.connectedCallback(),Ke(),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion()),this._hasPendingFlips()&&this._ensureMarchTimer()}_hasPendingFlips(){return Object.entries(this._target).some(([e,t])=>this._displayed[e]!==t)}disconnectedCallback(){super.disconnectedCallback(),this._clearFlipTimer()}shouldUpdate(e){if(!this._config)return!1;if(e.has(`_config`)||e.has(`_versionMismatch`)||e.has(`_displayed`)||e.has(`_target`)||e.has(`_justFlipped`))return!0;let t=e.get(`hass`);if(!t||!this.hass)return!0;let n=this._resolveStopEids();return n.length!==0&&n.some(e=>t.states[e]!==this.hass.states[e])}willUpdate(e){if(!this._config||!e.has(`hass`)&&!e.has(`_config`))return;let t=this._gatherRows(),n=this._maxDestLen(t),r=this._maxLineLen(t);for(let e=0;e<t.length;e++){let i=t[e];i&&(this._diffFlipField(Q(e,`line`),(i.line??`?`).toUpperCase().padStart(r,` `)),this._diffFlipField(Q(e,`dest`),(i.towards??``).toUpperCase().padEnd(n,` `)),this._diffFlipField(Q(e,`cd`),Xn(i.countdown)))}for(let e=t.length;e<this._config.max_rows;e++)this._diffFlipField(Q(e,`line`),null),this._diffFlipField(Q(e,`dest`),null),this._diffFlipField(Q(e,`cd`),null)}_clearFlipTimer(){this._marchTimer!==null&&(clearInterval(this._marchTimer),this._marchTimer=null)}_diffFlipField(e,t){if(t===null){if(e in this._displayed){let{[e]:t,...n}=this._displayed;this._displayed=n}if(e in this._target){let{[e]:t,...n}=this._target;this._target=n}if(e in this._justFlipped){let{[e]:t,...n}=this._justFlipped;this._justFlipped=n}return}if(this._displayed[e]===void 0){this._displayed={...this._displayed,[e]:t},this._target={...this._target,[e]:t};return}this._target[e]!==t&&(this._target={...this._target,[e]:t},this._ensureMarchTimer())}_ensureMarchTimer(){this._marchTimer===null&&(this._marchTimer=setInterval(()=>this._marchTick(),130))}_marchTick(){let e={...this._displayed},t={},n=!1;for(let[r,i]of Object.entries(this._target)){let a=e[r]??``;if(a===i)continue;let o=Math.max(a.length,i.length),s=[],c={};for(let e=0;e<o;e++){let t=a[e]??` `,n=i[e]??` `;t===n?s.push(t):(c[e]=t,s.push(Jn(t,n)))}e[r]=s.join(``),Object.keys(c).length>0&&(t[r]=c,n=!0)}this._displayed=e,this._justFlipped=t,n||this._clearFlipTimer()}async _checkCardVersion(){try{this._versionMismatch=await ut(this.hass,`wiener_linien_austria/flap_card_version`,`2.0.0`)}catch(e){console.warn(`[wiener-linien-austria-flap-card] version probe failed`,e)}}_resolveStopEids(){let e=this._config?.entities??[],t=this.hass?.states,n=e.map(e=>e.entity).filter(e=>t?.[e]);if(n.length===0&&e.length===0){let e=Ln(this.hass)[0];e&&n.push(e)}return n.length===0&&e.length>0&&!this._fallbackWarned&&(this._fallbackWarned=!0,console.warn(`[wiener-linien-austria-flap-card] none of the configured entities exist in hass.states (${e.map(e=>e.entity).join(`, `)})`)),n}_maxDestLen(e){return Math.max(0,...e.map(e=>(e.towards??``).length))}_maxLineLen(e){return Math.max(0,...e.map(e=>(e.line??`?`).length))}_gatherRows(){if(!this._config)return[];let e=this._config.entities??[],t=this._config.accessibility_only,n=[];for(let r of e){let e=this.hass?.states?.[r.entity]?.attributes??{},i=un(Array.isArray(e.departures)?e.departures:[],{direction:r.direction,lines:r.lines,line_directions:r.line_directions,walk_times:r.walk_times,accessibility_only:t});n.push(...i)}let r=e=>Number.isFinite(e.countdown)?e.countdown:1/0;return n.sort((e,t)=>r(e)-r(t)),n.slice(0,this._config.max_rows)}_t(e,t){return V(`flap.${e}`,{hassLanguage:this.hass?.language},t)}render(){if(!this._config)return A;let e=this._config,t=this._resolveStopEids(),n=this._gatherRows(),r=t[0]??``,i=r?this.hass?.states?.[r]?.attributes??{}:{},a=i.stop_name||i.friendly_name||``,o=i.server_time,s=zn(this.hass,t),c=e.show_platform&&n.some(e=>e.platform),l=(n[0]?.type??``)===fn,u=this._t(l?`gleis`:`steig`),d=this.hass?.themes?.darkMode===!1,f={flap:!0,[`flap--size-${e.size}`]:e.size!==`regular`,"flap--has-platform":c,"flap--light":d,"flap--no-line":!e.show_line_column,"flap--no-housing":!e.housing},p=this._resolveStationHeaderStyle(e.station_bg,e.entities,n,s),m=e.show_header?Wn({left:e.header_left,right:e.header_right,serverTime:o,t:e=>this._t(e),lang:this.hass?.language}):A,h=e.hide_attribution?``:typeof i.attribution==`string`&&i.attribution||`Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0`;return O`
      <ha-card style="padding:0;overflow:hidden;">
        <div class=${z(f)}>
          ${pt(this._versionMismatch,e=>this._t(e),`flap-banner`)}
          ${m}
          ${e.show_station_name?O`<div
                class="flap-header"
                role="group"
                style=${B(p)}
              >
                <div class="flap-header__station">${a}</div>
              </div>`:A}
          <div class="flap-panel">
            ${this._renderBoard(t,n,c,u,e.show_accessibility,!e.show_line_column,s)}
            ${h?O`<div class="flap-foot">${h}</div>`:A}
          </div>
        </div>
      </ha-card>
    `}_resolveStationHeaderStyle(e,t,n,r){if(e===`white`)return{background:`#ffffff`,color:`#1a1410`};if(e===`black`)return{background:`#000000`,color:`var(--flap-cream-hi)`};let i;if(e===`line`?i=t[0]?.lines?.[0]??n[0]?.line:e.startsWith(`line:`)&&(i=e.slice(5)),!i)return{background:`var(--wl-orange)`};let a=qt(i,{},r);return{background:a.background===`var(--primary-color)`?`var(--wl-orange)`:a.background,color:`var(--flap-on-color-fg)`}}_renderBoard(e,t,n,r,i,a,o){let s=this._maxDestLen(t),c=this._maxLineLen(t);if(e.length===0)return O`<div class="flap-empty">${this._t(`no_entity`)}</div>`;if(t.length===0){let t=e.some(e=>{let t=this.hass?.states?.[e]?.attributes??{};return Array.isArray(t.departures)&&t.departures.length>0}),n=e.some(e=>{let t=this.hass?.states?.[e]?.attributes??{};return typeof t.stale_departures==`number`&&t.stale_departures>0}),r=t?`no_data`:n?`stale_feed`:`betriebsschluss`;return O`<div class="flap-empty">${this._t(r)}</div>`}let l=Yn[this._config?.size??`regular`],u=s*l+Math.max(0,s-1)*2,d=i?u+6+l:u;return O`
      <div
        class=${z({"flap-board":!0,"flap-board--has-platform":n,"flap-board--no-line":a})}
        role="list"
        aria-label=${this._t(`departures_list`)}
      >
        <div class="flap-colheader" aria-hidden="true">
          ${a?A:O`<span class="flap-colheader__line"
                >${this._t(`col_line`)}</span
              >`}
          <span
            class="flap-colheader__dest"
            style=${B({maxWidth:`${d}px`})}
          >
            <span>${this._t(`col_dest`)}</span>
            ${i?O`<span class="flap-colheader__step-free"
                  >${this._t(`col_step_free`)}</span
                >`:A}
          </span>
          ${n?O`<span class="flap-colheader__platform"
                >${r}</span
              >`:A}
          <span class="flap-colheader__cd">${this._t(`col_cd`)}</span>
        </div>
        ${t.map((e,t)=>this._renderRow(e,t,o,n,a,s,c))}
      </div>
    `}_renderRow(e,t,n,r,i,a,o){let s=this._config,c=Number.isFinite(e.countdown)?e.countdown:null,l=c!==null&&c<=0,u=(e.line??`?`).toUpperCase(),d=u.padStart(o,` `),f=(e.towards??``).toUpperCase(),p=[u,f,c===null?this._t(`no_data`):l?this._t(`at_platform`):this._t(`countdown_minutes`,{n:String(c)})].filter(Boolean).join(` — `),m=qt(u,{},n),h=m.background===`var(--primary-color)`?{blankSpace:!0}:{tileBg:m.background,blankSpace:!0},g=this._renderFlipString(Xn(e.countdown),Q(t,`cd`),{blankSpace:!0}),_=r?O`<div class="flap-cell flap-cell--platform" aria-hidden="true">
          ${e.platform?this._renderTile(e.platform,void 0,0,{wide:!0}):this._renderTile(` `,void 0,0,{wide:!0,blankSpace:!0})}
        </div>`:A;return O`
      <div class="flap-row" role="listitem" aria-label=${p}>
        ${i?A:O`<div class="flap-cell flap-cell--line" aria-hidden="true">
              ${this._renderFlipString(d,Q(t,`line`),h)}
            </div>`}
        <div class="flap-cell flap-cell--dest" aria-hidden="true">
          ${this._renderFlipString(f.padEnd(a,` `),Q(t,`dest`),{blankSpace:!0})}
          ${s.show_accessibility?e.barrier_free?this._renderPictogramTile(`mdi:wheelchair-accessibility`,this._t(`barrier_free_title`)):this._renderAccessibilityBlankTile(this._t(`not_barrier_free_title`)):A}
        </div>
        ${_}
        <div class="flap-cell flap-cell--cd" aria-hidden="true">
          <span class="flap-cd-tiles">${g}</span>
          ${s.show_min_unit&&c!==null?O`<span class="flap-cd-unit">${this._t(`unit_min`)}</span>`:A}
        </div>
      </div>
    `}_renderFlipString(e,t,n={}){let r=(this._displayed[t]??e).split(``),i=this._justFlipped[t]??{};return O`<span class="flap-tiles" aria-label=${e}
      >${r.map((e,t)=>We(`${t}:${e}`,this._renderTile(e,i[t],t,n)))}</span
    >`}_renderTile(e,t,n,r={}){if(e===` `&&!r.blankSpace)return O`<span class="flap-space" aria-hidden="true">&nbsp;</span>`;let i=e===` `,a=i?void 0:r.tileBg,o=i?void 0:r.tileFg,s=t!==void 0,c=B({"--tile-i":String(n),...a?{"--tile-bg":a}:{},...o?{"--tile-fg":o}:{}}),l=z({"flap-tile":!0,"flap-tile--wide":r.wide===!0,"flap-tile--color":a!==void 0,"flap-tile--flipping":s,"flap-tile--blank":i}),u=e===` `?``:e;return O`<span class=${l} style=${c}>
      <span class="flap-tile__half flap-tile__half--top"
        ><span class="flap-tile__glyph">${u}</span></span
      >
      <span class="flap-tile__half flap-tile__half--bottom"
        ><span class="flap-tile__glyph">${u}</span></span
      >
      <span class="flap-tile__seam" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--l" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--r" aria-hidden="true"></span>
      ${s?O`<span class="flap-tile__leaf"
            ><span class="flap-tile__glyph">${t===` `?``:t}</span></span
          >`:A}
    </span>`}_renderPictogramTile(e,t){return O`<span
      class="flap-tile flap-tile--pictogram"
      aria-label=${t}
    >
      <span class="flap-tile__half flap-tile__half--top"></span>
      <span class="flap-tile__half flap-tile__half--bottom"></span>
      <span class="flap-tile__pictogram-overlay">
        <ha-icon class="flap-tile__pictogram" .icon=${e}></ha-icon>
      </span>
      <span class="flap-tile__seam" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--l" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--r" aria-hidden="true"></span>
    </span>`}_renderAccessibilityBlankTile(e){return O`<span
      class="flap-tile flap-tile--a11y-blank"
      aria-label=${e}
    >
      <span class="flap-tile__half flap-tile__half--top"></span>
      <span class="flap-tile__half flap-tile__half--bottom"></span>
      <span class="flap-tile__seam" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--l" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--r" aria-hidden="true"></span>
    </span>`}static{this.styles=c`@property --tile-bg {
syntax: "<color>";
inherits: true;
initial-value: transparent;
}
:host {
display: block;
isolation: isolate;
color-scheme: light dark;
--flap-housing: #1a1612;
--flap-bg: #0d0b08;
--flap-cream-hi: #f3eacd;
--flap-cream: #e8ddbe;
--flap-cream-lo: #cfc29c;
--flap-ink: #1a1410;
--flap-seam: rgba(0, 0, 0, 0.6);
--flap-pin: rgba(0, 0, 0, 0.7);
--wl-orange: #e97e00;
--flap-a11y: #0079c2;
--flap-a11y-hi: #1c93d8;
--flap-a11y-lo: #006099;
--flap-on-color-fg: #f3eacd;
--flap-header-fg: #f3eacd;
--flap-quiet-fg: rgba(255, 255, 255, 0.85);
}
.flap--light {
--flap-housing: #e0d5b5;
--flap-bg: #f3eacd;
--flap-cream-hi: #3a3a3a;
--flap-cream: #2c2c2c;
--flap-cream-lo: #1f1f1f;
--flap-ink: #ffffff;
--flap-seam: rgba(0, 0, 0, 0.7);
--flap-pin: rgba(0, 0, 0, 0.85);
--flap-quiet-fg: rgba(0, 0, 0, 0.6);
}
.flap.flap--light {
box-shadow: 0 6px 22px rgba(0, 0, 0, 0.18);
}
.flap {
background: var(--flap-housing);
border-radius: 10px;
padding: 6px;
box-shadow:
inset 0 1px 0 rgba(255, 255, 255, 0.05),
inset 0 -1px 0 rgba(0, 0, 0, 0.6),
0 6px 22px rgba(0, 0, 0, 0.45);
font-family: "Barlow Condensed", "Saira Condensed", "WL Sans Condensed",
"WL Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
Helvetica, Arial, sans-serif;
color: var(--flap-cream);
box-sizing: border-box;
}
.flap-header {
background: var(--wl-orange);
color: var(--flap-header-fg);
border-radius: 4px 4px 0 0;
display: flex;
align-items: center;
justify-content: center;
padding: 0 14px;
height: 50px;
font-family: "Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI",
Roboto, Helvetica, Arial, sans-serif;
font-weight: 800;
letter-spacing: 0.02em;
box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.18);
}
.flap-header__station {
text-align: center;
font-size: 22px;
letter-spacing: 0.04em;
}
.flap-foot {
margin-top: 14px;
font-family: "Work Sans", "WL Sans", sans-serif;
font-size: 11px;
line-height: 1.3;
letter-spacing: 0.02em;
color: var(--flap-cream-lo);
text-align: center;
overflow-wrap: anywhere;
}
.flap-panel:has(.flap-foot) {
padding-bottom: 12px;
}
.flap--no-housing.flap {
background: transparent;
padding: 0;
box-shadow: none;
}
.flap--no-housing .flap-header {
border-radius: 4px 4px 0 0;
}
.flap--no-housing > .flap-panel:first-of-type {
border-radius: 4px;
}
.flap-panel {
background: var(--flap-bg);
border-radius: 0 0 4px 4px;
padding: 10px 14px 12px;
background-image: linear-gradient(
180deg,
rgba(255, 255, 255, 0.025) 0%,
rgba(255, 255, 255, 0) 30%
);
}
.flap > .flap-panel:first-of-type {
border-radius: 4px;
}
.flap-board {
display: grid;
grid-template-columns: auto 1fr auto;
column-gap: 14px;
row-gap: 6px;
align-items: center;
}
.flap-board--has-platform {
grid-template-columns: auto 1fr auto auto;
}
.flap-board--no-line {
grid-template-columns: 1fr auto;
}
.flap-board--no-line.flap-board--has-platform {
grid-template-columns: 1fr auto auto;
}
.flap-colheader {
display: grid;
grid-template-columns: subgrid;
grid-column: 1 / -1;
align-items: end;
padding-bottom: 2px;
font-family: "Work Sans", "WL Sans", sans-serif;
font-weight: 600;
font-size: 13px;
letter-spacing: 0.12em;
text-transform: uppercase;
color: var(--flap-cream-lo);
}
.flap-colheader__platform {
text-align: center;
}
.flap-colheader__line {
text-align: start;
}
.flap-colheader__dest {
display: flex;
align-items: end;
justify-content: space-between;
gap: 12px;
min-width: 0;
}
.flap-colheader__step-free {
text-align: end;
}
.flap-colheader__cd {
text-align: end;
}
.flap-row {
display: grid;
grid-template-columns: subgrid;
grid-column: 1 / -1;
align-items: center;
min-height: 44px;
}
.flap-cell--line {
display: inline-flex;
}
.flap-cell--dest {
display: inline-flex;
align-items: center;
gap: 6px;
overflow: hidden;
}
.flap-cell--platform {
display: inline-flex;
align-items: center;
justify-content: center;
}
.flap-cell--cd {
display: inline-flex;
align-items: baseline;
gap: 6px;
justify-content: flex-end;
}
.flap-cd-tiles {
display: inline-flex;
gap: 2px;
}
.flap-cd-unit {
font-family: "Work Sans", "WL Sans", sans-serif;
font-weight: 600;
font-size: 13px;
color: var(--flap-cream-lo);
letter-spacing: 0.12em;
text-transform: uppercase;
align-self: end;
padding-bottom: 6px;
}
.flap-tiles {
display: inline-flex;
gap: 2px;
}
.flap-space {
display: inline-block;
width: 0.45em;
}
.flap-tile {
position: relative;
display: inline-block;
width: 32px;
height: 44px;
perspective: 220px;
overflow: visible;
filter: drop-shadow(0 1.5px 0 rgba(0, 0, 0, 0.5));
transition: --tile-bg 320ms ease;
}
.flap-tile--wide {
width: 38px;
}
.flap-tile__half {
position: absolute;
left: 0;
right: 0;
height: 50%;
overflow: hidden;
display: flex;
justify-content: center;
color: var(--flap-ink);
backface-visibility: hidden;
}
.flap-tile__half--top {
top: 0;
align-items: flex-start;
background: linear-gradient(
180deg,
var(--flap-cream-hi) 0%,
var(--flap-cream) 100%
);
box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
border-radius: 2.5px 2.5px 0 0;
}
.flap-tile__half--bottom {
bottom: 0;
align-items: flex-end;
background: linear-gradient(
180deg,
var(--flap-cream) 0%,
var(--flap-cream-lo) 100%
);
box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.18);
border-radius: 0 0 2.5px 2.5px;
}
.flap-tile__glyph {
display: block;
height: 44px;
font-size: 30px;
line-height: 44px;
font-weight: 700;
font-feature-settings: "tnum" 1;
}
.flap-tile--wide .flap-tile__glyph {
font-size: 32px;
}
.flap-tile__seam {
position: absolute;
left: 0;
right: 0;
top: calc(50% - 0.5px);
height: 1px;
background: var(--flap-seam);
z-index: 2;
pointer-events: none;
}
.flap-tile__seam::after {
content: "";
position: absolute;
left: 0;
right: 0;
top: 1px;
height: 1px;
background: rgba(255, 255, 255, 0.18);
}
.flap-tile__pin {
position: absolute;
top: calc(50% - 1.5px);
width: 3px;
height: 3px;
border-radius: 50%;
background: var(--flap-pin);
z-index: 3;
pointer-events: none;
}
.flap-tile__pin--l {
left: -1px;
}
.flap-tile__pin--r {
right: -1px;
}
.flap-tile--color .flap-tile__half--top {
background: linear-gradient(
180deg,
color-mix(in oklab, var(--tile-bg, #888) 78%, white 22%) 0%,
var(--tile-bg, #888) 100%
);
color: var(--tile-fg, var(--flap-on-color-fg));
}
.flap-tile--color .flap-tile__half--bottom {
background: linear-gradient(
180deg,
var(--tile-bg, #888) 0%,
color-mix(in oklab, var(--tile-bg, #888) 84%, black 16%) 100%
);
color: var(--tile-fg, var(--flap-on-color-fg));
}
.flap-tile--color .flap-tile__seam {
background: rgba(0, 0, 0, 0.4);
}
.flap-tile--color .flap-tile__seam::after {
background: rgba(255, 255, 255, 0.22);
}
.flap-tile--pictogram .flap-tile__half--top {
background: linear-gradient(
180deg,
var(--flap-a11y-hi) 0%,
var(--flap-a11y) 100%
);
}
.flap-tile--pictogram .flap-tile__half--bottom {
background: linear-gradient(
180deg,
var(--flap-a11y) 0%,
var(--flap-a11y-lo) 100%
);
}
.flap-tile--pictogram .flap-tile__seam {
background: rgba(0, 0, 0, 0.45);
}
.flap-tile--pictogram .flap-tile__seam::after {
background: rgba(255, 255, 255, 0.28);
}
.flap-tile__pictogram-overlay {
position: absolute;
inset: 0;
display: flex;
align-items: center;
justify-content: center;
z-index: 1;
color: var(--flap-on-color-fg);
pointer-events: none;
}
.flap-tile__pictogram {
--mdc-icon-size: 26px;
color: var(--flap-on-color-fg);
}
.flap--size-medium .flap-tile__pictogram {
--mdc-icon-size: 22px;
}
.flap--size-small .flap-tile__pictogram {
--mdc-icon-size: 18px;
}
.flap-tile__leaf {
position: absolute;
left: 0;
right: 0;
top: 0;
height: 50%;
overflow: hidden;
display: flex;
justify-content: center;
align-items: flex-start;
background: linear-gradient(
180deg,
var(--flap-cream-hi) 0%,
var(--flap-cream) 100%
);
color: var(--flap-ink);
box-shadow:
inset 0 1px 0 rgba(255, 255, 255, 0.45),
0 1px 2px rgba(0, 0, 0, 0.35);
border-radius: 2.5px 2.5px 1px 1px;
z-index: 4;
backface-visibility: hidden;
transform-origin: bottom center;
transform: rotateX(0deg);
}
.flap-tile--color .flap-tile__leaf {
background: linear-gradient(
180deg,
color-mix(in oklab, var(--tile-bg, #888) 78%, white 22%) 0%,
var(--tile-bg, #888) 100%
);
color: var(--tile-fg, var(--flap-on-color-fg));
}
.flap-tile--flipping .flap-tile__leaf {
animation: flapLeaf 130ms cubic-bezier(0.4, 0, 0.7, 1) forwards;
}
@keyframes flapLeaf {
to {
transform: rotateX(-90deg);
}
}
.flap-empty {
text-align: center;
padding: 24px 0;
font-family: "Barlow Condensed", "WL Sans Condensed", sans-serif;
font-weight: 600;
font-size: 20px;
letter-spacing: 0.08em;
text-transform: uppercase;
color: var(--flap-cream);
}
.flap--size-medium .flap-tile {
width: 28px;
height: 38px;
}
.flap--size-medium .flap-tile--wide {
width: 34px;
}
.flap--size-medium .flap-tile__glyph {
height: 38px;
font-size: 26px;
line-height: 38px;
}
.flap--size-medium .flap-row {
min-height: 38px;
}
.flap--size-small .flap-tile {
width: 22px;
height: 30px;
}
.flap--size-small .flap-tile--wide {
width: 28px;
}
.flap--size-small .flap-tile__glyph {
height: 30px;
font-size: 20px;
line-height: 30px;
}
.flap--size-small .flap-row {
min-height: 30px;
}
.flap-banner {
background: #ffa000;
color: #1a1410;
padding: 6px 10px;
margin-bottom: 8px;
display: flex;
align-items: center;
justify-content: space-between;
gap: 8px;
font-family: "Work Sans", sans-serif;
border-radius: 4px;
font-size: 12px;
}
.flap-banner button {
background: #1a1410;
color: #ffa000;
border: none;
border-radius: 3px;
padding: 3px 10px;
font-weight: 600;
cursor: pointer;
font-family: inherit;
}
a:focus-visible,
button:focus-visible {
outline: 2px solid var(--flap-cream-hi);
outline-offset: 2px;
border-radius: 4px;
}
.retro-station-header {
--flap-housing: #1a1612;
--flap-cream-hi: #f3eacd;
--flap-ink: #1a1410;
display: flex;
align-items: center;
justify-content: space-between;
background: var(--flap-housing);
color: var(--flap-cream-hi);
padding: 6px 10px;
gap: 8px;
font-family: "WL Sans Condensed", "WL Sans", -apple-system,
BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
font-weight: 700;
font-size: 1.1em;
letter-spacing: 0.02em;
border-radius: 4px 4px 0 0;
box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.6);
}
.retro-station-header + .flap-header {
border-radius: 0;
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
color: var(--flap-cream-hi);
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
}
.retro-station-header__tile {
display: inline-flex;
align-items: center;
justify-content: center;
background: var(--flap-cream-hi);
color: var(--flap-ink);
flex-shrink: 0;
width: 1.4em;
height: 1.4em;
padding: 0.12em;
box-sizing: border-box;
border-radius: 2px;
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
BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
font-weight: 700;
font-size: 0.9em;
line-height: 1;
}
.retro-station-header__chip {
display: inline-flex;
align-items: center;
justify-content: center;
background: var(--flap-cream-hi);
color: var(--flap-ink);
flex-shrink: 0;
height: 1.4em;
padding: 0 0.4em;
box-sizing: border-box;
border-radius: 2px;
font-family: "WL Sans Condensed", "WL Sans", -apple-system,
BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
font-weight: 700;
line-height: 1;
letter-spacing: 0;
white-space: nowrap;
}
.retro-station-header__chip--clock {
gap: 0.25em;
font-variant-numeric: tabular-nums;
}
.retro-station-header__chip--date {
font-variant-numeric: tabular-nums;
}
.retro-station-header__chip-icon {
--mdc-icon-size: 1em;
display: inline-flex;
align-items: center;
color: inherit;
flex-shrink: 0;
}
.flap--size-medium .retro-station-header {
font-size: 1em;
padding: 5px 10px;
}
.flap--size-small .retro-station-header {
font-size: 0.9em;
padding: 4px 8px;
}
@container (inline-size < 360px) {
.retro-station-header__text {
display: none;
}
}
@media (prefers-reduced-motion: reduce) {
.flap-tile {
transition: none;
}
.flap-tile--flipping .flap-tile__leaf {
animation: flapLeafFade 60ms ease-out forwards;
animation-delay: 0ms;
}
@keyframes flapLeafFade {
to {
opacity: 0;
}
}
}`}};Y([ze({attribute:!1})],$.prototype,`hass`,void 0),Y([F()],$.prototype,`_config`,void 0),Y([F()],$.prototype,`_versionMismatch`,void 0),Y([F()],$.prototype,`_displayed`,void 0),Y([F()],$.prototype,`_target`,void 0),Y([F()],$.prototype,`_justFlipped`,void 0),$=Y([Ie(`wiener-linien-austria-flap-card`)],$);export{$ as WienerLinienAustriaFlapCard};
// Wiener Linien Austria — bundled by Rollup. Edit sources in src/, then `npm run build`.
function e(e,t,i,r){var n,s=arguments.length,o=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(o=(s<3?n(o):s>3?n(t,i,o):n(t,i))||o);return s>3&&o&&Object.defineProperty(t,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),n=new WeakMap;let s=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=n.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(t,e))}return e}toString(){return this.cssText}};const o=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[r+1],e[0]);return new s(i,e,r)},a=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new s("string"==typeof e?e:e+"",void 0,r))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,_=globalThis,f=_.trustedTypes,g=f?f.emptyScript:"",m=_.reactiveElementPolyfillSupport,b=(e,t)=>e,v={toAttribute(e,t){switch(t){case Boolean:e=e?g:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},w=(e,t)=>!l(e,t),y={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:w};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=y){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);void 0!==r&&c(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:n}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){const s=r?.call(this);n?.call(this,t),this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??y}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,r)=>{if(i)e.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of r){const r=document.createElement("style"),n=t.litNonce;void 0!==n&&r.setAttribute("nonce",n),r.textContent=i.cssText,e.appendChild(r)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(void 0!==r&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:v).toAttribute(t,i.type);this._$Em=e,null==n?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(void 0!==r&&this._$Em!==r){const e=i.getPropertyOptions(r),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:v;this._$Em=r;const s=n.fromAttribute(t,e.type);this[r]=s??this._$Ej?.get(r)??s,this._$Em=null}}requestUpdate(e,t,i,r=!1,n){if(void 0!==e){const s=this.constructor;if(!1===r&&(n=this[e]),i??=s.getPropertyOptions(e),!((i.hasChanged??w)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:n},s){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),!0!==n||void 0!==s)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,r=this[t];!0!==e||this._$AL.has(t)||void 0===r||this.C(t,void 0,i,r)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[b("elementProperties")]=new Map,$[b("finalized")]=new Map,m?.({ReactiveElement:$}),(_.reactiveElementVersions??=[]).push("2.1.2");const x=globalThis,k=e=>e,S=x.trustedTypes,A=S?S.createPolicy("lit-html",{createHTML:e=>e}):void 0,E="$lit$",z=`lit$${Math.random().toFixed(9).slice(2)}$`,T="?"+z,C=`<${T}>`,M=document,D=()=>M.createComment(""),U=e=>null===e||"object"!=typeof e&&"function"!=typeof e,R=Array.isArray,L="[ \t\n\f\r]",O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,N=/-->/g,P=/>/g,H=RegExp(`>|${L}(?:([^\\s"'>=/]+)(${L}*=${L}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,F=/"/g,B=/^(?:script|style|textarea|title)$/i,W=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),I=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),V=new WeakMap,q=M.createTreeWalker(M,129);function G(e,t){if(!R(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(t):t}const Z=(e,t)=>{const i=e.length-1,r=[];let n,s=2===t?"<svg>":3===t?"<math>":"",o=O;for(let t=0;t<i;t++){const i=e[t];let a,l,c=-1,d=0;for(;d<i.length&&(o.lastIndex=d,l=o.exec(i),null!==l);)d=o.lastIndex,o===O?"!--"===l[1]?o=N:void 0!==l[1]?o=P:void 0!==l[2]?(B.test(l[2])&&(n=RegExp("</"+l[2],"g")),o=H):void 0!==l[3]&&(o=H):o===H?">"===l[0]?(o=n??O,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?H:'"'===l[3]?F:j):o===F||o===j?o=H:o===N||o===P?o=O:(o=H,n=void 0);const h=o===H&&e[t+1].startsWith("/>")?" ":"";s+=o===O?i+C:c>=0?(r.push(a),i.slice(0,c)+E+i.slice(c)+z+h):i+z+(-2===c?t:h)}return[G(e,s+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),r]};class Y{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let n=0,s=0;const o=e.length-1,a=this.parts,[l,c]=Z(e,t);if(this.el=Y.createElement(l,i),q.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(r=q.nextNode())&&a.length<o;){if(1===r.nodeType){if(r.hasAttributes())for(const e of r.getAttributeNames())if(e.endsWith(E)){const t=c[s++],i=r.getAttribute(e).split(z),o=/([.?@])?(.*)/.exec(t);a.push({type:1,index:n,name:o[2],strings:i,ctor:"."===o[1]?te:"?"===o[1]?ie:"@"===o[1]?re:ee}),r.removeAttribute(e)}else e.startsWith(z)&&(a.push({type:6,index:n}),r.removeAttribute(e));if(B.test(r.tagName)){const e=r.textContent.split(z),t=e.length-1;if(t>0){r.textContent=S?S.emptyScript:"";for(let i=0;i<t;i++)r.append(e[i],D()),q.nextNode(),a.push({type:2,index:++n});r.append(e[t],D())}}}else if(8===r.nodeType)if(r.data===T)a.push({type:2,index:n});else{let e=-1;for(;-1!==(e=r.data.indexOf(z,e+1));)a.push({type:7,index:n}),e+=z.length-1}n++}}static createElement(e,t){const i=M.createElement("template");return i.innerHTML=e,i}}function J(e,t,i=e,r){if(t===I)return t;let n=void 0!==r?i._$Co?.[r]:i._$Cl;const s=U(t)?void 0:t._$litDirective$;return n?.constructor!==s&&(n?._$AO?.(!1),void 0===s?n=void 0:(n=new s(e),n._$AT(e,i,r)),void 0!==r?(i._$Co??=[])[r]=n:i._$Cl=n),void 0!==n&&(t=J(e,n._$AS(e,t.values),n,r)),t}class Q{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??M).importNode(t,!0);q.currentNode=r;let n=q.nextNode(),s=0,o=0,a=i[0];for(;void 0!==a;){if(s===a.index){let t;2===a.type?t=new X(n,n.nextSibling,this,e):1===a.type?t=new a.ctor(n,a.name,a.strings,this,e):6===a.type&&(t=new ne(n,this,e)),this._$AV.push(t),a=i[++o]}s!==a?.index&&(n=q.nextNode(),s++)}return q.currentNode=M,r}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),U(e)?e===K||null==e||""===e?(this._$AH!==K&&this._$AR(),this._$AH=K):e!==this._$AH&&e!==I&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>R(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==K&&U(this._$AH)?this._$AA.nextSibling.data=e:this.T(M.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Y.createElement(G(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const e=new Q(r,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=V.get(e.strings);return void 0===t&&V.set(e.strings,t=new Y(e)),t}k(e){R(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const n of e)r===t.length?t.push(i=new X(this.O(D()),this.O(D()),this,this.options)):i=t[r],i._$AI(n),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ee{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,n){this.type=1,this._$AH=K,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=K}_$AI(e,t=this,i,r){const n=this.strings;let s=!1;if(void 0===n)e=J(this,e,t,0),s=!U(e)||e!==this._$AH&&e!==I,s&&(this._$AH=e);else{const r=e;let o,a;for(e=n[0],o=0;o<n.length-1;o++)a=J(this,r[i+o],t,o),a===I&&(a=this._$AH[o]),s||=!U(a)||a!==this._$AH[o],a===K?e=K:e!==K&&(e+=(a??"")+n[o+1]),this._$AH[o]=a}s&&!r&&this.j(e)}j(e){e===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===K?void 0:e}}class ie extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==K)}}class re extends ee{constructor(e,t,i,r,n){super(e,t,i,r,n),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??K)===I)return;const i=this._$AH,r=e===K&&i!==K||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==K&&(i===K||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const se=x.litHtmlPolyfillSupport;se?.(Y,X),(x.litHtmlVersions??=[]).push("3.3.2");const oe=globalThis;let ae=class extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const r=i?.renderBefore??t;let n=r._$litPart$;if(void 0===n){const e=i?.renderBefore??null;r._$litPart$=n=new X(t.insertBefore(D(),e),e,void 0,i??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};ae._$litElement$=!0,ae.finalized=!0,oe.litElementHydrateSupport?.({LitElement:ae});const le=oe.litElementPolyfillSupport;le?.({LitElement:ae}),(oe.litElementVersions??=[]).push("4.2.2");const ce=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},de={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:w},he=(e=de,t,i)=>{const{kind:r,metadata:n}=i;let s=globalThis.litPropertyMetadata.get(n);if(void 0===s&&globalThis.litPropertyMetadata.set(n,s=new Map),"setter"===r&&((e=Object.create(e)).wrapped=!0),s.set(i.name,e),"accessor"===r){const{name:r}=i;return{set(i){const n=t.get.call(this);t.set.call(this,i),this.requestUpdate(r,n,e,!0,i)},init(t){return void 0!==t&&this.C(r,void 0,e,t),t}}}if("setter"===r){const{name:r}=i;return function(i){const n=this[r];t.call(this,i),this.requestUpdate(r,n,e,!0,i)}}throw Error("Unsupported decorator location: "+r)};function pe(e){return(t,i)=>"object"==typeof i?he(e,t,i):((e,t,i)=>{const r=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),r?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function ue(e){return pe({...e,state:!0,attribute:!1})}const _e=1,fe=2,ge=e=>(...t)=>({_$litDirective$:e,values:t});let me=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},be=class extends me{constructor(e){if(super(e),this.it=K,e.type!==fe)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===K||null==e)return this._t=void 0,this.it=e;if(e===I)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}};be.directiveName="unsafeHTML",be.resultType=1;const ve=ge(be),we=ge(class extends me{constructor(e){if(super(e),e.type!==_e||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e)));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const i=e.element.classList;for(const e of this.st)e in t||(i.remove(e),this.st.delete(e));for(const e in t){const r=!!t[e];r===this.st.has(e)||this.nt?.has(e)||(r?(i.add(e),this.st.add(e)):(i.remove(e),this.st.delete(e)))}return I}}),ye="important",$e=" !"+ye,xe=ge(class extends me{constructor(e){if(super(e),e.type!==_e||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,i)=>{const r=e[i];return null==r?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?i.removeProperty(e):i[e]=null);for(const e in t){const r=t[e];if(null!=r){this.ft.add(e);const t="string"==typeof r&&r.endsWith($e);e.includes("-")||t?i.setProperty(e,t?r.slice(0,-11):r,t?ye:""):i[e]=r}}return I}}),ke=o`
  :host {
    display: block;
    container-type: inline-size;
    container-name: wlcard;

    --nb-accent: var(--primary-color);
    --nb-radius-sm: 6px;
    --nb-radius-md: 10px;
    --nb-radius-lg: var(--ha-card-border-radius, 12px);
    --nb-pad-x: 16px;
    --nb-pad-y: 14px;
    --nb-row-gap: 12px;
    --nb-tile-size: 40px;
    --nb-slot-radius: 10px;
    --nb-slot-gap: 6px;
    --nb-slot-min-h: 44px;
    --nb-metric-size: 2.25rem;
  }

  ha-card {
    overflow: hidden;
  }

  .wrap {
    display: flex;
    flex-direction: column;
    gap: var(--nb-row-gap);
    padding: var(--nb-pad-y) var(--nb-pad-x);
  }

  /* Tabs sit flush with the card edge — direct child of <ha-card>, not
     inside .wrap. Three active cues (colour + weight + inset underline)
     so the active tab reads without colour vision. */
  .tabs {
    display: flex;
    height: 44px;
    padding: 0 14px;
    border-bottom: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar {
    display: none;
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
    transition: color 0.16s ease, box-shadow 0.16s ease;
  }
  .tab:hover {
    color: var(--primary-text-color);
  }
  .tab.active {
    color: var(--primary-color);
    font-weight: 700;
    box-shadow: inset 0 -2px 0 var(--primary-color);
  }

  /* Per-station section. Inline --nb-accent on this element drives the
     icon-tile tint, line-badge fallback, alert tints, and CTA fill. */
  .station {
    display: flex;
    flex-direction: column;
    gap: var(--nb-row-gap);
  }
  .station + .station {
    margin-top: var(--nb-row-gap);
    padding-top: var(--nb-row-gap);
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
  }

  /* Header: square accent tile (left), title block (centre), circular
     icon-action (right). Mirrors HA's hui-tile-card composition. */
  .head {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .icon-tile {
    width: var(--nb-tile-size);
    height: var(--nb-tile-size);
    border-radius: var(--nb-radius-md);
    background: color-mix(in srgb, var(--nb-accent) 18%, transparent);
    color: var(--nb-accent);
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
    font-size: 0.95rem;
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
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: transparent;
    color: var(--secondary-text-color);
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: background-color 0.16s ease, color 0.16s ease;
  }
  .icon-action:hover {
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    color: var(--primary-text-color);
  }
  .icon-action ha-icon {
    --mdc-icon-size: 20px;
  }

  /* Hero metric: stacked numerals + UPPERCASE label, with a chip row
     pinned to the bottom-right. */
  .hero {
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 8px 12px;
  }
  .metric {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .metric-row {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
  }
  .metric-value {
    font-size: var(--nb-metric-size);
    font-weight: 600;
    line-height: 1;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.5px;
  }
  .metric-of {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--secondary-text-color);
    font-variant-numeric: tabular-nums;
  }
  .metric-label {
    margin-top: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.2px;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }
  .hero-chips {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-left: auto;
  }

  /* Chips: tablet-style pill, tabular numerals so countdowns don't
     jiggle. Default tint reads from --primary-color so neutral chips
     stay calm; severity flags override per class. */
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-color) 14%, transparent);
    color: var(--primary-color);
    font-size: 0.75rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    forced-color-adjust: none;
  }
  .chip.muted {
    background: color-mix(in srgb, var(--secondary-text-color) 14%, transparent);
    color: var(--secondary-text-color);
  }
  .chip ha-icon {
    --mdc-icon-size: 14px;
  }

  /* Status flag pills. Same shape as .chip but severity-tinted. */
  .flag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    forced-color-adjust: none;
  }
  .flag.warning {
    background: color-mix(in srgb, var(--warning-color, #ffa000) 16%, transparent);
    color: var(--warning-color, #ffa000);
  }
  .flag.error {
    background: color-mix(in srgb, var(--error-color, #db4437) 16%, transparent);
    color: var(--error-color, #db4437);
  }
  .flag ha-icon {
    --mdc-icon-size: 14px;
  }

  /* Filled CTA — used by the version banner reload button. */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 32px;
    padding: 0 14px;
    border: none;
    border-radius: 999px;
    background: var(--nb-accent);
    color: var(--text-primary-color, #fff);
    font-family: inherit;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 1px 2px color-mix(in srgb, #000 12%, transparent);
    transition: filter 0.16s ease, transform 0.06s ease;
    forced-color-adjust: none;
  }
  .btn-primary:hover {
    filter: brightness(1.08);
  }
  .btn-primary:active {
    transform: translateY(1px);
  }
  .btn-primary ha-icon {
    --mdc-icon-size: 16px;
  }

  /* Version banner — accent surface that uses warning tokens. */
  .banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: var(--nb-radius-md);
    background: color-mix(in srgb, var(--warning-color, #ffa000) 16%, transparent);
    color: var(--primary-text-color);
    font-size: 0.85rem;
  }
  .banner > span {
    flex: 1;
  }
  .banner .btn-primary {
    background: var(--warning-color, #ffa000);
  }

  /* Alerts: traffic + elevator items use the same expandable surface. */
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
    border-radius: var(--nb-radius-md);
    background: color-mix(in srgb, var(--warning-color, #ffa000) 12%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--warning-color, #ffa000) 22%, transparent);
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
    color: var(--warning-color, #ffa000);
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
    font-weight: 700;
    color: #fff;
    background: var(--primary-color);
    forced-color-adjust: none;
  }
  /* Modern reveal: 0fr ↔ 1fr animates to intrinsic height without
     clipping multi-line traffic descriptions. */
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
    line-height: 1.4;
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
    transition: transform 0.16s ease;
    flex-shrink: 0;
  }
  .alert.expanded .alert-chevron {
    transform: rotate(180deg);
  }

  /* Departure rows: rack-style repeated unit. Soft accent surface so the
     section reads as a single coherent block rather than a row of
     dividers. */
  .dep-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  .dep-row {
    display: grid;
    grid-template-columns: max-content 1fr auto auto;
    align-items: center;
    gap: 8px;
    padding: 6px 2px;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
  }
  .dep-row:last-child {
    border-bottom: none;
  }
  .line-badge {
    text-align: center;
    font-weight: 700;
    color: #fff;
    border-radius: 6px;
    padding: 3px 8px;
    min-width: 2.4em;
    font-size: 0.85rem;
    background: var(--primary-color);
    box-shadow: inset 0 -2px 0 color-mix(in srgb, #000 18%, transparent);
    forced-color-adjust: none;
  }
  .towards {
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--primary-text-color);
  }
  .type-icon {
    --mdc-icon-size: 16px;
    color: var(--secondary-text-color);
    margin-right: 4px;
    vertical-align: 1px;
  }
  .delay {
    color: var(--warning-color, #ffa000);
    font-size: 0.85rem;
    font-weight: 500;
    margin-left: 4px;
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
    color: var(--warning-color, #ffa000);
  }
  .countdown {
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    min-width: 50px;
    text-align: right;
    color: var(--primary-text-color);
  }

  /* Empty / fallback states */
  .empty {
    padding: 18px 0;
    color: var(--secondary-text-color);
    text-align: center;
    font-size: 0.85rem;
  }

  /* Footer: attribution timestamp / etc. Right-pin via margin-left:auto. */
  .foot {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-top: 8px;
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    font-size: 0.7rem;
    color: var(--secondary-text-color);
  }
  .timestamp {
    margin-left: auto;
  }

  /* Dev-mode strip — visible only on rpi25 / ?wl_debug=1 */
  .dev-strip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border: 1px dashed var(--secondary-text-color, rgba(0, 0, 0, 0.3));
    border-radius: var(--nb-radius-sm);
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
    border-radius: var(--nb-radius-sm);
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

  /* Container density ladder. One token tweak per breakpoint cascades
     through every component above. */
  @container wlcard (inline-size < 360px) {
    :host {
      --nb-pad-x: 12px;
      --nb-pad-y: 12px;
      --nb-tile-size: 36px;
      --nb-slot-min-h: 40px;
      --nb-metric-size: 2rem;
    }
    .tabs {
      padding: 0 8px;
    }
    .tab {
      padding: 0 8px;
      font-size: 0.8125rem;
    }
    .towards {
      white-space: normal;
    }
  }

  @container wlcard (inline-size > 480px) {
    :host {
      --nb-pad-x: 20px;
      --nb-pad-y: 16px;
      --nb-tile-size: 44px;
      --nb-metric-size: 2.5rem;
    }
    .icon-tile ha-icon {
      --mdc-icon-size: 24px;
    }
  }

  /* Accessibility primitives — verbatim from the project spec. */
  .tab:focus-visible,
  .alert:focus-visible,
  .icon-action:focus-visible,
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    border-radius: 6px;
  }
  .btn-primary:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 3px;
  }

  @media (forced-colors: active) {
    .icon-tile,
    .chip,
    .flag,
    .btn-primary,
    .line-badge,
    .alert,
    .dep-row {
      forced-color-adjust: none;
      outline: 1px solid CanvasText;
    }
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
  }
`,Se="1.2.1",Ae={U1:"#E3000F",U2:"#A862A4",U3:"#EF7C00",U4:"#00963F",U5:"#008F95",U6:"#9D6830"};var Ee={no_data:"Keine Abfahrten verfügbar",betriebsschluss:"Betriebsschluss",min:"min",now:"jetzt",version_update:"Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",no_entities_picked:"Keine Haltestelle ausgewählt",no_entities_available:"Keine Wiener-Linien-Sensoren gefunden",departures_list:"Kommende Abfahrten",barrier_free_title:"Barrierefrei zugänglich",disturbance_title:"Verkehrsbehinderung gemeldet",dir_h:"H",dir_r:"R",dir_both:"Beide",traffic_label:"Störung",traffic_until:"Bis",traffic_updated:"aktualisiert",elevator_label:"Aufzug außer Betrieb",elevator_until:"Bis",open_in_maps:"In Karte öffnen",delay_singular:"1 Minute verspätet",delay_plural:"{n} Minuten verspätet",devmode_title:"DEV",devmode_traffic_btn:"Test Störung",devmode_elevator_btn:"Test Aufzug",devmode_clear_btn:"Löschen",editor:{section_sensors:"Haltestellen",sensors_hint:"Eine oder mehrere Haltestellen auswählen",section_filters:"Filter pro Haltestelle",filters_hint:"Linien und/oder Richtung pro Haltestelle einschränken",lines_label:"Linien",direction_label:"Richtung",walk_time_label:"Fußweg (min)",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis du dort bist. Leer lassen = kein Filter.",walk_time_placeholder:"–",walk_time_aria:"Fußweg in Minuten für Linie {line} Richtung {towards}",section_colors:"Linienfarben",colors_hint:"Optional: Farben überschreiben. U-Bahn-Standardwerte sind gesetzt.",reset_color:"Zurücksetzen",pick_color_for_line:"Farbe für Linie {line} wählen",section_display:"Anzeige",max_departures:"Anzahl Abfahrten pro Haltestelle",show_accessibility:"Barrierefrei-Symbol anzeigen",show_type_icon:"Verkehrsmittel-Symbol anzeigen",show_traffic_info:"Störungen anzeigen",show_elevator_info:"Aufzugsinfo anzeigen",show_delay:"Verspätungen anzeigen",show_hero_metric:"Countdown zur nächsten Abfahrt anzeigen",show_departures:"Abfahrtsliste anzeigen",hide_attribution:"Datenquelle ausblenden",layout_label:"Layout mehrerer Haltestellen",layout_stacked:"Gestapelt",layout_tabs:"Reiter",no_sensors_available:"Keine Wiener-Linien-Sensoren verfügbar. Erst eine Haltestelle über Einstellungen → Geräte & Dienste hinzufügen.",no_lines_available:"Linien erscheinen hier, sobald Haltestellen ausgewählt wurden."}},ze={no_entity:"Keine Haltestelle ausgewählt",no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",betriebsschluss:"Betriebsschluss",dir_h:"H",dir_r:"R",gleis:"GLEIS",steig:"STEIG",version_update:"Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",departures_list:"Kommende Abfahrten",at_platform:"Einfahrt",countdown_minutes:"{n} Minuten",race_finished:"Barrierefreiheits-Rennen beendet",barrier_free_title:"Barrierefrei zugänglich",editor:{section_sensor:"Haltestelle",section_direction:"Richtung",section_line:"Linie",section_display:"Darstellung",sensor_hint:"Eine Haltestelle auswählen.",direction_hint:"Hin- oder Rückfahrt — die Retro-Anzeige zeigt nur eine Richtung.",direction_no_data:"Keine Abfahrten in dieser Richtung",line_hint:"Optional: nur eine Linie anzeigen. Aktiven Chip erneut antippen = alle Linien.",section_walk_time:"Fußweg zur Haltestelle",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis du dort bist. Leer lassen = kein Filter.",walk_time_no_data:"Keine Abfahrten in dieser Richtung. Richtung wechseln oder warten, bis der Sensor Linien meldet.",walk_time_placeholder:"–",walk_time_aria:"Fußweg in Minuten für Linie {line} Richtung {towards}",show_platform:"Gleis/Steig anzeigen",show_station_name:"Stationsnamen anzeigen",section_station:"Stationsnamen-Schild",station_bg_label:"Hintergrund",station_bg_default:"Standard",station_bg_white:"Weiß",station_bg_black:"Schwarz",station_hint:"„Standard“ zeigt U-Bahn-Stationen in der Linienfarbe und alle anderen auf weiß. Oder wähle fix Weiß oder Schwarz.",size_label:"Größe",size_small:"Klein",size_medium:"Mittel",size_regular:"Normal",style_label:"Stil",style_classic:"Klassisch",style_warm:"Warm",flicker_label:"Linien-Flimmern",wheelchair_race_label:"Rollstuhl-Rennen",no_sensors:"Keine Wiener-Linien-Sensoren verfügbar. Erst eine Haltestelle über Einstellungen → Geräte & Dienste hinzufügen.",no_lines:"Für diese Haltestelle und Richtung sind aktuell keine Linien im Sensor."}},Te={modern:Ee,retro:ze},Ce={no_data:"No departures available",betriebsschluss:"End of service",min:"min",now:"now",version_update:"Wiener Linien Austria updated to v{v} — please reload",version_reload:"Reload",no_entities_picked:"No stop selected",no_entities_available:"No Wiener Linien sensors found",departures_list:"Upcoming departures",barrier_free_title:"Step-free access",disturbance_title:"Traffic disruption reported",dir_h:"H",dir_r:"R",dir_both:"Both",traffic_label:"Disruption",traffic_until:"Until",traffic_updated:"updated",elevator_label:"Elevator out of service",elevator_until:"Until",open_in_maps:"Open in maps",delay_singular:"1 minute late",delay_plural:"{n} minutes late",devmode_title:"DEV",devmode_traffic_btn:"Test disruption",devmode_elevator_btn:"Test elevator",devmode_clear_btn:"Clear",editor:{section_sensors:"Stops",sensors_hint:"Pick one or more stops to display",section_filters:"Per-stop filters",filters_hint:"Optionally restrict lines or direction per stop",lines_label:"Lines",direction_label:"Direction",walk_time_label:"Walking time (min)",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_placeholder:"–",walk_time_aria:"Walk time in minutes for line {line} towards {towards}",section_colors:"Line colours",colors_hint:"Optional overrides. Metro defaults are already set.",reset_color:"Reset",pick_color_for_line:"Pick colour for line {line}",section_display:"Display",max_departures:"Departures per stop",show_accessibility:"Show step-free icon",show_type_icon:"Show vehicle-type icon",show_traffic_info:"Show disruption alerts",show_elevator_info:"Show elevator outages",show_delay:"Show delays",show_hero_metric:"Show next-departure countdown",show_departures:"Show departure list",hide_attribution:"Hide data source",layout_label:"Multi-stop layout",layout_stacked:"Stacked",layout_tabs:"Tabs",no_sensors_available:"No Wiener Linien sensors available. Add a stop first via Settings → Devices & Services.",no_lines_available:"Lines appear here once stops are selected."}},Me={no_entity:"No stop selected",no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",betriebsschluss:"End of service",dir_h:"H",dir_r:"R",gleis:"PLATF.",steig:"STAND",version_update:"Retro card updated to v{v} — please reload",version_reload:"Reload",departures_list:"Upcoming departures",at_platform:"At platform",countdown_minutes:"{n} minutes",race_finished:"Accessibility race finished",barrier_free_title:"Step-free access",editor:{section_sensor:"Stop",section_direction:"Direction",section_line:"Line",section_display:"Display",sensor_hint:"Pick a single stop.",direction_hint:"Outbound or return — the retro display only shows one direction.",direction_no_data:"No departures in this direction",line_hint:"Optional: restrict to a single line. Tap the active chip again to show all lines.",section_walk_time:"Walking time to stop",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_no_data:"No departures in this direction. Switch direction or wait until the sensor reports lines.",walk_time_placeholder:"–",walk_time_aria:"Walk time in minutes for line {line} towards {towards}",show_platform:"Show platform",show_station_name:"Show station name",section_station:"Station name sign",station_bg_label:"Background",station_bg_default:"Default",station_bg_white:"White",station_bg_black:"Black",station_hint:"“Default” uses the line colour for U-Bahn stops and white for everything else. Or force white or black for all stops.",size_label:"Size",size_small:"Small",size_medium:"Medium",size_regular:"Regular",style_label:"Style",style_classic:"Classic",style_warm:"Warm",flicker_label:"Line badge flicker",wheelchair_race_label:"Wheelchair race",no_sensors:"No Wiener Linien sensors available. Add a stop first via Settings → Devices & Services.",no_lines:"The sensor currently reports no lines for this stop + direction."}},De={modern:Ce,retro:Me};const Ue={de:Object.freeze({__proto__:null,default:Te,modern:Ee,retro:ze}),en:Object.freeze({__proto__:null,default:De,modern:Ce,retro:Me})};function Re(e,t){const i=function(e,t){return e.split(".").reduce((e,t)=>{if(e&&"object"==typeof e&&t in e)return e[t]},t)}(e,t);return"string"==typeof i?i:void 0}function Le(e,t,i){const r=function(e){return"en"===(e.configLanguage||e.hassLanguage||"de").replace("-","_").split("_")[0]?"en":"de"}(t);let n=Re(e,Ue[r]??Ue.de);if(void 0===n&&(n=Re(e,Ue.de)),void 0===n)return e;if(i)for(const[e,t]of Object.entries(i))n=n.replace(`{${e}}`,String(t));return n}function Oe(e){if("string"==typeof e)return e.startsWith("sensor.")?{entity:e}:null;if(!e||"object"!=typeof e)return null;const t=e,i="string"==typeof t.entity?t.entity:null;if(!i?.startsWith("sensor."))return null;const r={entity:i};if(Array.isArray(t.lines)){const e=t.lines.filter(e=>"string"==typeof e&&e.length>0);e.length&&(r.lines=e)}"H"!==t.direction&&"R"!==t.direction||(r.direction=t.direction);const n=function(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,r]of Object.entries(e)){const e="number"==typeof r?r:"string"==typeof r?Number(r):NaN;Number.isFinite(e)&&(e<0||e>120||(t[i]=Math.round(e)))}return Object.keys(t).length?t:void 0}(t.walk_times);return n&&(r.walk_times=n),r}const Ne=6,Pe=!1,He=!0,je=!0,Fe=!0,Be=!1,We=!0,Ie=!0,Ke=!1;function Ve(e){let t=[];Array.isArray(e.entities)?t=e.entities:"string"==typeof e.entity&&(t=[{entity:e.entity,lines:e.lines,direction:e.direction,walk_times:e.walk_times}]);const i=[],r=new Set;for(const e of t){const t=Oe(e);t&&(r.has(t.entity)||(r.add(t.entity),i.push(t)))}const n=Number(e.max_departures),s=Number.isFinite(n)?Math.max(1,Math.min(20,Math.round(n))):Ne,o={};if(e.line_colors&&"object"==typeof e.line_colors)for(const[t,i]of Object.entries(e.line_colors))"string"==typeof i&&/^#[0-9A-Fa-f]{3,8}$/.test(i.trim())&&(o[t.toUpperCase()]=i.trim());return{type:e.type||"custom:wiener-linien-austria-card",entities:i,max_departures:s,line_colors:o,show_accessibility:e.show_accessibility??Pe,show_traffic_info:e.show_traffic_info??He,show_elevator_info:e.show_elevator_info??je,show_delay:e.show_delay??Fe,show_type_icon:e.show_type_icon??Be,show_hero_metric:e.show_hero_metric??We,show_departures:e.show_departures??Ie,hide_attribution:e.hide_attribution??Ke,layout:"tabs"===e.layout?"tabs":"stacked"}}function qe(e,t,i="var(--primary-color)"){const r=e.toUpperCase();return t[r]??Ae[r]??i}function Ge(e){if(!e)return[];const t=[];for(const[i,r]of Object.entries(e.states??{})){if(!i.startsWith("sensor."))continue;const e=r?.attributes??{};if("number"!=typeof e.diva)continue;if(!Array.isArray(e.departures))continue;(e.attribution??"").toLowerCase().includes("wiener linien")&&t.push(i)}return t.sort(),t}function Ze(e,t,i){return`${e}|${t}|${i}`}function Ye(e){const t=new Set;for(const i of e?.departures??[])i.line&&t.add(i.line);return Array.from(t).sort()}function Je(e){return function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}(e).replace(/&lt;br\s*\/?&gt;/gi,"<br>")}function Qe(e,t="de"){if(!e)return"";const i=Date.parse(e);if(!Number.isFinite(i))return e;try{return new Date(i).toLocaleString("en"===t?"en-GB":"de-AT",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"})}catch{return e}}let Xe=class extends ae{setConfig(e){this._config=Ve(e)}_lang(){return this.hass?.language?.startsWith("de")?"de":"en"}_et(e){return Le(`modern.editor.${e}`,{hassLanguage:this.hass?.language})}_t(e){return Le(`modern.${e}`,{hassLanguage:this.hass?.language})}_fire(e){this._config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}_updateStop(e,t){if(!this._config)return;const i=this._config.entities.map(i=>i.entity===e?t({...i}):i);this._fire({...this._config,entities:i})}_toggleStop(e){if(!this._config)return;const t=this._config.entities.findIndex(t=>t.entity===e),i=t>=0?this._config.entities.filter((e,i)=>i!==t):[...this._config.entities,{entity:e}];this._fire({...this._config,entities:i})}_toggleLine(e,t){this._updateStop(e,e=>{const i=new Set(e.lines??[]);return i.has(t)?i.delete(t):i.add(t),i.size>0?e.lines=[...i]:delete e.lines,e})}_setDirection(e,t){this._updateStop(e,e=>(null===t?delete e.direction:e.direction=t,e))}_setWalkTime(e,t,i){const r=parseInt(i,10),n=Number.isFinite(r)&&r>0?Math.min(120,r):null;this._updateStop(e,e=>{const i={...e.walk_times??{}};return null===n?delete i[t]:i[t]=n,Object.keys(i).length?e.walk_times=i:delete e.walk_times,e})}_setLineColor(e,t){if(!this._config)return;const i={...this._config.line_colors,[e.toUpperCase()]:t};this._fire({...this._config,line_colors:i})}_resetLineColor(e){if(!this._config)return;const t={...this._config.line_colors};delete t[e.toUpperCase()],this._fire({...this._config,line_colors:t})}_setLayout(e){this._config&&this._config.layout!==e&&this._fire({...this._config,layout:e})}_setMaxDepartures(e){if(!this._config)return;const t=Math.max(1,Math.min(20,Math.round(e)));t!==this._config.max_departures&&this._fire({...this._config,max_departures:t})}_toggleField(e,t){this._config&&this._fire({...this._config,[e]:t})}_swallowKeys(e){e.stopPropagation()}render(){if(!this._config||!this.hass)return K;const e=this._config,t=Ge(this.hass),i=new Set(e.entities.map(e=>e.entity));return W`
      <div class="editor">
        ${this._renderStopsSection(t,i)}
        ${this._renderFiltersSection()}
        ${this._renderDisplaySection()}
        ${this._renderColorsSection()}
      </div>
    `}_renderStopsSection(e,t){const i=e.length?e.map(e=>{const i=function(e,t){const i=e?.states?.[t],r=i?.attributes??{};return r.stop_name||r.friendly_name||t}(this.hass,e),r=e.split(".")[1]??e,n=t.has(e);return W`
            <button
              type="button"
              class=${we({chip:!0,selected:n})}
              @click=${()=>this._toggleStop(e)}
            >
              <span class="stop-name">${i}</span>
              <span class="eid">${r}</span>
            </button>
          `}):W`<div class="editor-hint">${this._et("no_sensors_available")}</div>`;return W`
      <div class="editor-section">
        <div class="section-header">${this._et("section_sensors")}</div>
        <div class="editor-hint">${this._et("sensors_hint")}</div>
        <div class="entity-chips">${i}</div>
      </div>
    `}_renderFiltersSection(){const e=this._config,t=e.entities.length?e.entities.map(e=>this._renderStopFilter(e)):W`<div class="editor-hint">${this._et("sensors_hint")}</div>`;return W`
      <div class="editor-section">
        <div class="section-header">${this._et("section_filters")}</div>
        <div class="editor-hint">${this._et("filters_hint")}</div>
        ${t}
      </div>
    `}_renderStopFilter(e){const t=this.hass?.states?.[e.entity]?.attributes;if(!t)return W``;const i=t.stop_name||e.entity,r=this._config.line_colors,n=Ye(t),s=new Set(e.lines??[]),o=e.direction??null,a=function(e){const t=[],i=new Set;for(const r of e?.departures??[]){const e=Ze(r.line,String(r.direction??""),r.towards);i.has(e)||(i.add(e),t.push({line:r.line,direction:String(r.direction??""),towards:r.towards,type:r.type}))}return t.sort((e,t)=>e.line===t.line?e.towards.localeCompare(t.towards):e.line.localeCompare(t.line)),t}(t).filter(e=>!o||e.direction===o);return W`
      <div class="stop-filter">
        <div class="stop-filter-header">${i}</div>

        <div class="stop-filter-row">
          <div class="stop-filter-row-label">${this._et("lines_label")}</div>
          <div class="line-chips">
            ${n.length?n.map(t=>{const i=0===s.size||s.has(t),n=qe(t,r),o=i?{background:n,borderColor:n,color:"#fff"}:{};return W`<button
                    type="button"
                    class=${we({chip:!0,selected:i})}
                    style=${xe(o)}
                    @click=${()=>this._toggleLine(e.entity,t)}
                  >${t}</button>`}):W`<div class="editor-hint">${this._et("no_lines_available")}</div>`}
          </div>
        </div>

        <div class="stop-filter-row">
          <div class="stop-filter-row-label">${this._et("direction_label")}</div>
          <div class="direction-buttons">
            <button
              type="button"
              class=${we({active:"H"===o})}
              @click=${()=>this._setDirection(e.entity,"H")}
            >${this._t("dir_h")}</button>
            <button
              type="button"
              class=${we({active:"R"===o})}
              @click=${()=>this._setDirection(e.entity,"R")}
            >${this._t("dir_r")}</button>
            <button
              type="button"
              class=${we({active:null===o})}
              @click=${()=>this._setDirection(e.entity,null)}
            >${this._t("dir_both")}</button>
          </div>
        </div>

        ${a.length?W`
              <div class="stop-filter-row">
                <div class="stop-filter-row-label">${this._et("walk_time_label")}</div>
                <div class="editor-hint">${this._et("walk_time_hint")}</div>
                <div class="walk-time-list">
                  ${a.map(t=>{const i=qe(t.line,r),n=Ze(t.line,t.direction,t.towards),s=e.walk_times?.[n],o=t.towards?`→ ${t.towards}`:"";return W`
                      <div class="walk-time-row">
                        <span class="walk-time-badge" style=${xe({background:i})}>${t.line}</span>
                        <span class="walk-time-towards" title=${t.towards}>${o}</span>
                        <input
                          type="number"
                          class="walk-time-input"
                          min="0"
                          max="120"
                          step="1"
                          inputmode="numeric"
                          placeholder=${this._et("walk_time_placeholder")}
                          aria-label=${this._et("walk_time_aria").replace("{line}",t.line).replace("{towards}",t.towards||"")}
                          .value=${void 0!==s?String(s):""}
                          @keydown=${this._swallowKeys}
                          @keyup=${this._swallowKeys}
                          @keypress=${this._swallowKeys}
                          @change=${t=>this._setWalkTime(e.entity,n,t.target.value)}
                        />
                      </div>
                    `})}
                </div>
              </div>
            `:K}
      </div>
    `}_renderDisplaySection(){const e=this._config;return W`
      <div class="editor-section">
        <div class="section-header">${this._et("section_display")}</div>

        <div class="toggle-row" style="gap:12px;">
          <span style="font-size:0.8125rem;">${this._et("layout_label")}</span>
          <div class="direction-buttons">
            <button
              type="button"
              class=${we({active:"stacked"===e.layout})}
              @click=${()=>this._setLayout("stacked")}
            >${this._et("layout_stacked")}</button>
            <button
              type="button"
              class=${we({active:"tabs"===e.layout})}
              @click=${()=>this._setLayout("tabs")}
            >${this._et("layout_tabs")}</button>
          </div>
        </div>

        <div class="slider-row">
          <span class="slider-label">${this._et("max_departures")}</span>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            .value=${String(e.max_departures)}
            @keydown=${this._swallowKeys}
            @keyup=${this._swallowKeys}
            @keypress=${this._swallowKeys}
            @change=${e=>this._setMaxDepartures(Number(e.target.value))}
          />
          <span class="slider-value">${e.max_departures}</span>
        </div>

        ${this._renderSwitch("show_hero_metric",e.show_hero_metric)}
        ${this._renderSwitch("show_departures",e.show_departures)}
        ${this._renderSwitch("show_accessibility",e.show_accessibility)}
        ${this._renderSwitch("show_type_icon",e.show_type_icon)}
        ${this._renderSwitch("show_traffic_info",e.show_traffic_info)}
        ${this._renderSwitch("show_elevator_info",e.show_elevator_info)}
        ${this._renderSwitch("show_delay",e.show_delay)}
        ${this._renderSwitch("hide_attribution",e.hide_attribution)}
      </div>
    `}_renderSwitch(e,t){const i=`wl-${e.replace(/_/g,"-")}-toggle`;return W`
      <div class="toggle-row">
        <label for=${i}>${this._et(e)}</label>
        <ha-switch
          id=${i}
          .checked=${t}
          @change=${t=>this._toggleField(e,t.target.checked)}
        ></ha-switch>
      </div>
    `}_renderColorsSection(){const e=this._config,t=function(e,t){const i=new Set;for(const r of t){const t=e?.states?.[r]?.attributes;for(const e of Ye(t))i.add(e)}return Array.from(i).sort()}(this.hass,e.entities.map(e=>e.entity)),i=e.line_colors;return W`
      <div class="editor-section">
        <div class="section-header">${this._et("section_colors")}</div>
        <div class="editor-hint">${this._et("colors_hint")}</div>
        ${t.length?t.map(e=>{const t=qe(e,i,"#888888"),r=t.startsWith("#")?t:"#888888",n=Boolean(i[e.toUpperCase()]),s=this._et("pick_color_for_line").replace("{line}",e);return W`
                <div class="color-row">
                  <span class="line-preview" aria-hidden="true" style=${xe({background:t})}>${e}</span>
                  <label
                    class="color-swatch"
                    style=${`--swatch-color: ${r};`}
                    title=${s}
                  >
                    <ha-icon icon="mdi:palette-swatch-variant" aria-hidden="true"></ha-icon>
                    <span class="color-swatch-hex">${r.toUpperCase()}</span>
                    <input
                      type="color"
                      class="color-swatch-input"
                      .value=${r}
                      .configValue=${`color_${e}`}
                      aria-label=${s}
                      @input=${t=>this._setLineColor(e,t.target.value)}
                      @change=${t=>this._setLineColor(e,t.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    class="reset-btn"
                    ?disabled=${!n}
                    @click=${()=>n&&this._resetLineColor(e)}
                  >${this._et("reset_color")}</button>
                </div>
              `}):W`<div class="editor-hint">${this._et("no_lines_available")}</div>`}
      </div>
    `}static{this.styles=o`
    :host { display: block; }
    .editor {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .editor-section {
      background: var(--secondary-background-color, rgba(0,0,0,0.04));
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .section-header {
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      color: var(--secondary-text-color);
    }
    .editor-hint {
      font-size: 0.75rem;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }
    .entity-chips, .line-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 44px;
      padding: 10px 16px;
      border-radius: 22px;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all 0.15s;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
    }
    .chip.selected {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color);
    }
    .chip:hover { opacity: 0.85; }
    .chip .stop-name { font-weight: 500; }
    .chip .eid {
      font-size: 0.6875rem;
      opacity: 0.7;
    }
    .stop-filter {
      padding: 8px 10px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .stop-filter-header {
      font-size: 0.8125rem;
      font-weight: 500;
    }
    .stop-filter-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .stop-filter-row-label {
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color);
    }
    .direction-buttons {
      display: inline-flex;
      gap: 4px;
    }
    .direction-buttons button {
      padding: 10px 16px;
      border-radius: 22px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 0.8125rem;
      cursor: pointer;
      min-height: 44px;
    }
    .direction-buttons button.active {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color);
    }
    .color-row {
      display: grid;
      grid-template-columns: 44px 1fr auto;
      align-items: center;
      gap: 10px;
    }
    .color-row .line-preview {
      display: inline-block;
      text-align: center;
      font-weight: 700;
      color: #fff;
      border-radius: 6px;
      padding: 4px 6px;
      font-size: 0.85rem;
      box-shadow: inset 0 -2px 0 color-mix(in srgb, #000 18%, transparent);
    }
    .color-swatch {
      --swatch-color: var(--primary-color);
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--swatch-color) 18%, transparent);
      color: var(--primary-text-color);
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.16s ease, transform 0.06s ease;
    }
    .color-swatch:hover {
      background: color-mix(in srgb, var(--swatch-color) 26%, transparent);
    }
    .color-swatch:active {
      transform: translateY(1px);
    }
    .color-swatch ha-icon {
      --mdc-icon-size: 20px;
      color: var(--swatch-color);
      flex-shrink: 0;
    }
    .color-swatch-hex {
      font-family: ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
    }
    .color-swatch-input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      border: 0;
      padding: 0;
      margin: 0;
      cursor: pointer;
      overflow: hidden;
    }
    .color-row .reset-btn {
      font-size: 0.6875rem;
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid var(--divider-color);
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .color-row .reset-btn[disabled] {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .slider-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .slider-row input[type="range"] {
      flex: 1;
      accent-color: var(--primary-color);
    }
    .slider-row .slider-label {
      font-size: 0.8125rem;
      color: var(--primary-text-color);
      min-width: 180px;
    }
    .slider-value {
      min-width: 24px;
      text-align: center;
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--primary-color);
    }
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .toggle-row label {
      font-size: 0.8125rem;
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .walk-time-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .walk-time-row {
      display: grid;
      grid-template-columns: 44px 1fr 72px;
      align-items: center;
      gap: 8px;
    }
    .walk-time-badge {
      text-align: center;
      font-weight: 700;
      color: #fff;
      border-radius: 4px;
      padding: 2px 4px;
      font-size: 0.9em;
    }
    .walk-time-towards {
      font-size: 0.8125rem;
      color: var(--primary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .walk-time-input {
      width: 100%;
      box-sizing: border-box;
      padding: 4px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color, transparent);
      color: var(--primary-text-color);
      font-size: 0.8125rem;
      text-align: right;
    }
    .walk-time-input::-webkit-outer-spin-button,
    .walk-time-input::-webkit-inner-spin-button {
      margin: 0;
    }
  `}};function et(e,t){return e?W`<span lang="de">${e}</span>`:t??""}function tt(e){switch(e){case"ptMetro":return"mdi:subway-variant";case"ptTram":return"mdi:tram";case"ptBusCity":case"ptBusNight":return"mdi:bus";default:return null}}e([pe({attribute:!1})],Xe.prototype,"hass",void 0),e([ue()],Xe.prototype,"_config",void 0),Xe=e([ce("wiener-linien-austria-card-editor")],Xe),console.info(`%c WIENER-LINIEN-AUSTRIA-CARD %c ${Se} `,"color: white; background: #E3000F; font-weight: 700;","color: #E3000F; background: white; font-weight: 700;"),window.customCards=window.customCards??[],window.customCards.push({type:"wiener-linien-austria-card",name:"Wiener Linien Austria",description:"Abfahrtsmonitor mit Störungen und Aufzugsinfo",preview:!0});let it=class extends ae{constructor(){super(...arguments),this._activeTab=0,this._versionMismatch=null,this._expandedTraffic=new Set,this._expandedElevator=new Set,this._debugTraffic=[],this._debugElevator=[],this._versionCheckDone=!1,this._devTestTraffic=()=>{const e=this._resolveStops(),t=[];for(const i of e)for(const e of this._attrs(i.entity).departures??[])e.line&&e.towards&&t.push(e);const i=this._randomFrom(t),r=i?.line||"U?",n=i?.towards||"Unbekannt",s=new Date;this._debugTraffic=[...this._debugTraffic,{name:`DEBUG-T-${Date.now()}`,title:`${r}: Testmeldung`,description:`Debug-Eintrag für Linie ${r} Richtung ${n}.`,description_html:`Debug-Eintrag für Linie ${r} Richtung ${n}.<br><br>Grund: Dev-Mode-Test.`,location:"Debug-Stelle",related_lines:[r],time_start:new Date(s.getTime()-18e5).toISOString(),time_end:new Date(s.getTime()+108e5).toISOString(),time_created:new Date(s.getTime()-18e5).toISOString(),time_last_update:s.toISOString(),status:"active"}]},this._devTestElevator=()=>{const e=this._resolveStops(),t=this._randomFrom(e);if(!t)return;const i=this._attrs(t.entity),r=i.stop_name||t.entity,n=i.departures??[],s=this._randomFrom(n)?.line||"",o=this._randomFrom(n)?.towards||"Unbekannt",a=new Date;this._debugElevator=[...this._debugElevator,{__debug_entity:t.entity,name:`DEBUG-E-${Date.now()}`,station:r,description:`${s||"Station"} Bahnsteig Richtung ${o} — Ausgang ${r}`,reason:"AUFZUGSERNEUERUNG Voraussichtlich bis Ende Mai außer Betrieb! (Dev-Mode-Test)",status:"außer Betrieb",related_lines:s?[s]:[],time_start:new Date(a.getTime()-27e5).toISOString(),time_end:new Date(a.getTime()+144e5).toISOString()}]},this._devClear=()=>{this._debugTraffic=[],this._debugElevator=[]}}setConfig(e){if(!e||"object"!=typeof e)throw new Error("wiener-linien-austria-card: config must be an object");const t=Array.isArray(e.entities),i="string"==typeof e.entity;if(!t&&!i)throw new Error("wiener-linien-austria-card: 'entities' (array) or legacy 'entity' (string) is required");this._config=Ve(e)}getCardSize(){const e=this._config?.entities.length??1;return Math.min(12,3+3*e)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:3}}static getConfigElement(){return document.createElement("wiener-linien-austria-card-editor")}static getStubConfig(e){const t=Ge(e);return{entities:t.length?[t[0]]:[],max_departures:6}}connectedCallback(){super.connectedCallback(),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion())}willUpdate(e){if(this._config&&(e.has("_config")||e.has("hass"))){const e=this._resolveStops();e.length&&this._activeTab>=e.length&&(this._activeTab=0)}}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_activeTab")||e.has("_versionMismatch")||e.has("_expandedTraffic")||e.has("_expandedElevator")||e.has("_debugTraffic")||e.has("_debugElevator"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._resolveStops().map(e=>e.entity);return i.some(e=>t.states[e]!==this.hass.states[e])}_lang(){return this.hass?.language?.startsWith("de")?"de":"en"}_t(e,t){return Le(`modern.${e}`,{hassLanguage:this.hass?.language},t)}async _checkCardVersion(){try{const e=await this.hass.callWS({type:"wiener_linien_austria/card_version"});e?.version&&e.version!==Se&&(this._versionMismatch=e.version)}catch{}}_resolveStops(){const e=(this._config?.entities??[]).filter(e=>this.hass?.states?.[e.entity]);if(e.length)return e;const t=Ge(this.hass);return t.length?[{entity:t[0]}]:[]}_attrs(e){return this.hass?.states?.[e]?.attributes??{}}render(){if(!this._config)return K;if(!this.hass)return W`<ha-card><div class="wrap"></div></ha-card>`;const e=this._config,t=this._resolveStops(),i="tabs"===e.layout&&t.length>=2,r=e.hide_attribution?"":t.map(e=>this._attrs(e.entity).attribution).find(e=>"string"==typeof e&&e.length>0)||"Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0";return W`
      <ha-card>
        ${i?this._renderTabs(t,this._activeTab):K}
        <div class="wrap">
          ${this._versionMismatch?this._renderBanner():K}
          ${e.show_traffic_info?this._renderTrafficBanner(t):K}
          ${this._renderBody(t,i)}
          ${this._renderFooter(r)}
        </div>
      </ha-card>
    `}_renderFooter(e){const t=this._isDevMode();return e||t?W`
      ${e?W`<div class="foot">
            <span class="timestamp">${e}</span>
          </div>`:K}
      ${t?this._renderDevModePanel():K}
    `:K}_renderBody(e,t){if(!e.length)return this._renderEmpty();if(t){const t=e[this._activeTab];return W`${this._renderStop(t,this._activeTab)}`}return W`${e.map(e=>this._renderStop(e))}`}_renderEmpty(){const e=Ge(this.hass).length?"no_entities_picked":"no_entities_available";return W`<div class="empty" role="status" aria-live="polite">${this._t(e)}</div>`}_renderTabs(e,t){return W`
      <div class="tabs" role="tablist">
        ${e.map((i,r)=>{const n=this._attrs(i.entity),s=n.stop_name||n.friendly_name||i.entity,o=r===t;return W`<button
            type="button"
            role="tab"
            id=${`wl-tab-${r}`}
            aria-controls=${`wl-tabpanel-${r}`}
            class=${we({tab:!0,active:r===t})}
            aria-selected=${o?"true":"false"}
            tabindex=${o?"0":"-1"}
            @click=${()=>this._setActiveTab(r)}
            @keydown=${t=>this._onTabKeydown(t,r,e.length)}
          >${s}</button>`})}
      </div>
    `}_setActiveTab(e){Number.isFinite(e)&&e!==this._activeTab&&(this._activeTab=e)}_onTabKeydown(e,t,i){let r=t;switch(e.key){case"ArrowRight":r=(t+1)%i;break;case"ArrowLeft":r=(t-1+i)%i;break;case"Home":r=0;break;case"End":r=i-1;break;default:return}e.preventDefault(),this._setActiveTab(r),this.updateComplete.then(()=>{const e=this.shadowRoot?.querySelectorAll('.tabs [role="tab"]');e?.[r]?.focus()})}_renderStop(e,t){const i=this._attrs(e.entity),r=i.stop_name||i.friendly_name,n=r||e.entity,s=function(e,t){const{lines:i,direction:r,walk_times:n}=t,s=i&&i.length?new Set(i):null;return e.filter(e=>{if(s&&!s.has(e.line))return!1;if(r&&e.direction!==r)return!1;if(n){const t=n[Ze(e.line,String(e.direction??""),e.towards)];if("number"==typeof t&&e.countdown<t)return!1}return!0})}(Array.isArray(i.departures)?i.departures:[],e),o=s.slice(0,this._config.max_departures),a=Array.isArray(i.elevator_info)?i.elevator_info:[],l=this._debugElevator.filter(t=>t.__debug_entity===e.entity),c=[...a,...l],d=this._config.show_elevator_info&&c.length>0,h=this._stopMapUrl(n,i.latitude,i.longitude),p=this._t("open_in_maps"),u=o.find(e=>Number.isFinite(e.countdown)&&e.countdown>0)??o[0],_=u?qe(u.line||"",this._config.line_colors):"var(--primary-color)",f=(g=u?.type,tt(g)??"mdi:bus-stop");var g;const m=u&&Number.isFinite(u.countdown)?u.countdown:null,b=null===m?"—":m<=0?this._t("now"):String(m),v=null!==m&&m>0?this._t("min"):"",w=u?.line&&u?.towards?`${u.line} → ${u.towards}`:this._t("departures_list"),y=void 0!==t;return W`
      <section
        class="station"
        style="--nb-accent: ${_};"
        id=${y?`wl-tabpanel-${t}`:K}
        role=${y?"tabpanel":K}
        aria-labelledby=${y?`wl-tab-${t}`:K}
        tabindex=${y?"0":K}
        aria-label=${n}
      >
        <header class="head">
          <span class="icon-tile" aria-hidden="true">
            <ha-icon icon=${f}></ha-icon>
          </span>
          <div class="title-block">
            <h3 class="title">${et(r,e.entity)}</h3>
            ${u?.line?W`<p class="subtitle">${et(u.towards)}</p>`:K}
          </div>
          ${h?W`<div class="head-actions">
                <a
                  class="icon-action"
                  href=${h}
                  target="_blank"
                  rel="noopener noreferrer"
                  title=${p}
                  aria-label="${p}: ${n}"
                ><ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon></a>
              </div>`:K}
        </header>

        ${this._config.show_hero_metric?W`<div class="hero">
              <div class="metric">
                <div class="metric-row">
                  <span
                    class="metric-value"
                    aria-live="polite"
                    aria-atomic="true"
                  >${b}${v?W` <span class="metric-of">${v}</span>`:K}</span>
                </div>
                <span class="metric-label" aria-hidden="true">${w}</span>
              </div>
              ${d?W`<div class="hero-chips">${this._renderElevatorFlag(c)}</div>`:K}
            </div>`:d?W`<div class="hero-chips">${this._renderElevatorFlag(c)}</div>`:K}

        ${d?this._renderElevatorDetails(c):K}
        ${this._config.show_departures?o.length?W`<ul class="dep-list" role="list" aria-label=${this._t("departures_list")}>
                ${o.map(e=>this._renderRow(e))}
              </ul>`:W`<div class="empty" role="status" aria-live="polite">
                ${this._t(i.server_time?"betriebsschluss":"no_data")}
              </div>`:K}
      </section>
    `}_renderElevatorFlag(e){const t=this._t("elevator_label"),i=e.map(e=>[e.station,e.description,e.reason].filter(e=>!!e).join(" — ")).join("\n");return W`
      <span class="flag warning" title="${t}:\n${i}">
        <ha-icon icon="mdi:elevator-passenger-off" aria-hidden="true"></ha-icon>
        ${t}
      </span>
    `}_renderElevatorDetails(e){return W`
      <div class="alert-list">
        ${e.map(e=>this._renderElevatorDetail(e))}
      </div>
    `}_renderElevatorDetail(e){const t=e.description||e.station||"",i=e.reason||"",r=Qe(e.time_end,this._lang()),n=Boolean(i||r),s=this._expandedElevator.has(e.name);return W`
      <div
        class=${we({alert:!0,expanded:s,"no-detail":!n})}
        role=${n?"button":"group"}
        tabindex=${n?"0":"-1"}
        aria-expanded=${n?s?"true":"false":K}
        aria-label=${t}
        @click=${()=>n&&this._toggleElevator(e.name)}
        @keydown=${t=>this._onExpanderKeydown(t,n,()=>this._toggleElevator(e.name))}
      >
        <ha-icon icon="mdi:elevator-passenger-off" aria-hidden="true"></ha-icon>
        <div class="alert-body">
          <div class="alert-summary">
            <div class="alert-title">${et(t)}</div>
          </div>
          ${n?W`<div class="alert-detail">
                <div class="alert-detail-inner">
                  ${i?W`<div class="alert-desc">${et(i)}</div>`:K}
                  ${r?W`<div class="alert-meta">
                        <span>${this._t("elevator_until")} ${r}</span>
                      </div>`:K}
                </div>
              </div>`:K}
        </div>
        ${n?W`<ha-icon class="alert-chevron" icon="mdi:chevron-down" aria-hidden="true"></ha-icon>`:K}
      </div>
    `}_toggleElevator(e){const t=new Set(this._expandedElevator);t.has(e)?t.delete(e):t.add(e),this._expandedElevator=t}_onExpanderKeydown(e,t,i){t&&("Enter"!==e.key&&" "!==e.key||(e.preventDefault(),i()))}_renderTrafficBanner(e){const t=new Set,i=[];for(const r of e)for(const e of this._attrs(r.entity).traffic_info??[])t.has(e.name)||(t.add(e.name),i.push(e));for(const e of this._debugTraffic)t.has(e.name)||(t.add(e.name),i.push(e));return i.length?W`
      <div class="alert-list">
        ${i.map(e=>this._renderTrafficItem(e))}
      </div>
    `:K}_renderTrafficItem(e){const t=this._config.line_colors,i=Array.isArray(e.related_lines)?e.related_lines:[],r=e.description_html?Je(e.description_html):e.description?Je(e.description):"",n=Qe(e.time_end,this._lang()),s=Qe(e.time_last_update,this._lang()),o=Qe(e.time_created,this._lang()),a=s&&s!==o?s:"",l=Boolean(e.location||n||a),c=Boolean(r||l),d=this._expandedTraffic.has(e.name),h={alert:!0,expanded:d,"no-detail":!c},p=e.title||this._t("traffic_label");return W`
      <div
        class=${we(h)}
        role=${c?"button":"group"}
        tabindex=${c?"0":"-1"}
        aria-expanded=${c?d?"true":"false":K}
        aria-label=${p}
        @click=${()=>c&&this._toggleTraffic(e.name)}
        @keydown=${t=>this._onExpanderKeydown(t,c,()=>this._toggleTraffic(e.name))}
      >
        <ha-icon icon="mdi:alert-octagon" aria-hidden="true"></ha-icon>
        <div class="alert-body">
          <div class="alert-summary">
            ${i.length?W`<div class="alert-lines">
                  ${i.map(e=>W`<span
                      class="alert-line-badge"
                      style=${xe({background:qe(e,t)})}
                    >${e}</span>`)}
                </div>`:K}
            <div class="alert-title">${e.title?et(e.title):this._t("traffic_label")}</div>
          </div>
          ${c?W`<div class="alert-detail">
                <div class="alert-detail-inner">
                  ${r?W`<div class="alert-desc">${ve(r)}</div>`:K}
                  ${l?W`<div class="alert-meta">
                        ${e.location?W`<span class="alert-location-chip">
                              <ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon>${et(e.location)}
                            </span>`:K}
                        ${n?W`<span>${this._t("traffic_until")} ${n}</span>`:K}
                        ${a?W`<span>${this._t("traffic_updated")} ${a}</span>`:K}
                      </div>`:K}
                </div>
              </div>`:K}
        </div>
        ${c?W`<ha-icon class="alert-chevron" icon="mdi:chevron-down" aria-hidden="true"></ha-icon>`:K}
      </div>
    `}_toggleTraffic(e){const t=new Set(this._expandedTraffic);t.has(e)?t.delete(e):t.add(e),this._expandedTraffic=t}_renderRow(e){const t=this._config.line_colors,i=e.line||"?",r=qe(i,t),n=Number.isFinite(e.countdown)?e.countdown:null,s=null===n?"—":n<=0?this._t("now"):`${n} ${this._t("min")}`,o=this._config.show_delay?function(e,t){if(!e||!t)return null;const i=Date.parse(e),r=Date.parse(t);return Number.isFinite(i)&&Number.isFinite(r)?Math.round((r-i)/6e4):null}(e.time_planned,e.time_real):null,a=null!==o&&o>=1?1===o?this._t("delay_singular"):this._t("delay_plural",{n:o}):"",l=this._config.show_accessibility,c=Boolean(e.traffic_jam||l&&e.barrier_free),d=this._config.show_type_icon?tt(e.type):null;return W`
      <li class="dep-row">
        <div class="line-badge" style=${xe({background:r})}>${i}</div>
        <div class="towards">
          ${d?W`<ha-icon class="type-icon" icon=${d} aria-hidden="true"></ha-icon>`:K}${et(e.towards)}${a?W` <span class="delay">${a}</span>`:K}
        </div>
        ${c?W`<span class="row-flags">
              ${e.traffic_jam?W`<ha-icon
                    class="disturbance"
                    icon="mdi:alert-circle"
                    role="img"
                    aria-label=${this._t("disturbance_title")}
                    title=${this._t("disturbance_title")}
                  ></ha-icon>`:K}
              ${l&&e.barrier_free?W`<ha-icon
                    class="a11y"
                    icon="mdi:wheelchair-accessibility"
                    role="img"
                    aria-label=${this._t("barrier_free_title")}
                    title=${this._t("barrier_free_title")}
                  ></ha-icon>`:K}
            </span>`:W`<span></span>`}
        <div class="countdown">${s}</div>
      </li>
    `}_stopMapUrl(e,t,i){return"number"==typeof t&&"number"==typeof i?`https://www.google.com/maps/search/?api=1&query=${t},${i}`:e?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e}, Wien`)}`:null}_renderBanner(){const e=this._t("version_update",{v:this._versionMismatch??""});return W`
      <div class="banner" role="alert">
        <span>${e}</span>
        <button type="button" class="btn-primary" @click=${this._reload}>
          <ha-icon icon="mdi:refresh" aria-hidden="true"></ha-icon>
          ${this._t("version_reload")}
        </button>
      </div>
    `}async _reload(){try{if(window.caches?.keys){const e=await window.caches.keys();await Promise.all(e.map(e=>window.caches.delete(e)))}}catch{}window.location.reload()}_isDevMode(){try{const e=window.location.hostname||"";if("rpi25"===e||e.startsWith("rpi25."))return!0;if((window.location.search||"").includes("wl_debug=1"))return!0}catch{}return!1}_renderDevModePanel(){return this._isDevMode()?W`
      <div class="dev-strip">
        <span class="dev-strip-label">${this._t("devmode_title")}</span>
        <button type="button" @click=${this._devTestTraffic}>${this._t("devmode_traffic_btn")}</button>
        <button type="button" @click=${this._devTestElevator}>${this._t("devmode_elevator_btn")}</button>
        <button type="button" class="dev-strip-clear" @click=${this._devClear}>
          ${this._t("devmode_clear_btn")}
        </button>
      </div>
    `:K}_randomFrom(e){return e.length?e[Math.floor(Math.random()*e.length)]:null}static{this.styles=ke}};e([pe({attribute:!1})],it.prototype,"hass",void 0),e([ue()],it.prototype,"_config",void 0),e([ue()],it.prototype,"_activeTab",void 0),e([ue()],it.prototype,"_versionMismatch",void 0),e([ue()],it.prototype,"_expandedTraffic",void 0),e([ue()],it.prototype,"_expandedElevator",void 0),e([ue()],it.prototype,"_debugTraffic",void 0),e([ue()],it.prototype,"_debugElevator",void 0),it=e([ce("wiener-linien-austria-card")],it);export{it as WienerLinienAustriaCard};

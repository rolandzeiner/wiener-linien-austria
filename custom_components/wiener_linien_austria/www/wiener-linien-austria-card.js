// Wiener Linien Austria — bundled by Rollup. Edit sources in src/, then `npm run build`.
function e(e,t,i,r){var n,a=arguments.length,o=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,r);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(o=(a<3?n(o):a>3?n(t,i,o):n(t,i))||o);return a>3&&o&&Object.defineProperty(t,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),n=new WeakMap;let a=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=n.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(t,e))}return e}toString(){return this.cssText}};const o=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[r+1],e[0]);return new a(i,e,r)},s=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new a("string"==typeof e?e:e+"",void 0,r))(t)})(e):e,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,_=globalThis,f=_.trustedTypes,g=f?f.emptyScript:"",m=_.reactiveElementPolyfillSupport,w=(e,t)=>e,b={toAttribute(e,t){switch(t){case Boolean:e=e?g:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},v=(e,t)=>!l(e,t),y={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:v};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=y){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);void 0!==r&&d(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:n}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){const a=r?.call(this);n?.call(this,t),this.requestUpdate(e,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??y}static _$Ei(){if(this.hasOwnProperty(w("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(w("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(w("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(s(e))}else void 0!==e&&t.push(s(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,r)=>{if(i)e.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of r){const r=document.createElement("style"),n=t.litNonce;void 0!==n&&r.setAttribute("nonce",n),r.textContent=i.cssText,e.appendChild(r)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(void 0!==r&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(t,i.type);this._$Em=e,null==n?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(void 0!==r&&this._$Em!==r){const e=i.getPropertyOptions(r),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:b;this._$Em=r;const a=n.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,i,r=!1,n){if(void 0!==e){const a=this.constructor;if(!1===r&&(n=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??v)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:n},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==n||void 0!==a)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,r=this[t];!0!==e||this._$AL.has(t)||void 0===r||this.C(t,void 0,i,r)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[w("elementProperties")]=new Map,x[w("finalized")]=new Map,m?.({ReactiveElement:x}),(_.reactiveElementVersions??=[]).push("2.1.2");const $=globalThis,k=e=>e,S=$.trustedTypes,A=S?S.createPolicy("lit-html",{createHTML:e=>e}):void 0,z="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+E,T=`<${C}>`,R=document,L=()=>R.createComment(""),M=e=>null===e||"object"!=typeof e&&"function"!=typeof e,H=Array.isArray,D="[ \t\n\f\r]",O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,P=/-->/g,N=/>/g,U=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,q=/"/g,W=/^(?:script|style|textarea|title)$/i,j=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),F=Symbol.for("lit-noChange"),V=Symbol.for("lit-nothing"),I=new WeakMap,K=R.createTreeWalker(R,129);function G(e,t){if(!H(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(t):t}const Z=(e,t)=>{const i=e.length-1,r=[];let n,a=2===t?"<svg>":3===t?"<math>":"",o=O;for(let t=0;t<i;t++){const i=e[t];let s,l,d=-1,c=0;for(;c<i.length&&(o.lastIndex=c,l=o.exec(i),null!==l);)c=o.lastIndex,o===O?"!--"===l[1]?o=P:void 0!==l[1]?o=N:void 0!==l[2]?(W.test(l[2])&&(n=RegExp("</"+l[2],"g")),o=U):void 0!==l[3]&&(o=U):o===U?">"===l[0]?(o=n??O,d=-1):void 0===l[1]?d=-2:(d=o.lastIndex-l[2].length,s=l[1],o=void 0===l[3]?U:'"'===l[3]?q:B):o===q||o===B?o=U:o===P||o===N?o=O:(o=U,n=void 0);const h=o===U&&e[t+1].startsWith("/>")?" ":"";a+=o===O?i+T:d>=0?(r.push(s),i.slice(0,d)+z+i.slice(d)+E+h):i+E+(-2===d?t:h)}return[G(e,a+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),r]};class Q{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let n=0,a=0;const o=e.length-1,s=this.parts,[l,d]=Z(e,t);if(this.el=Q.createElement(l,i),K.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(r=K.nextNode())&&s.length<o;){if(1===r.nodeType){if(r.hasAttributes())for(const e of r.getAttributeNames())if(e.endsWith(z)){const t=d[a++],i=r.getAttribute(e).split(E),o=/([.?@])?(.*)/.exec(t);s.push({type:1,index:n,name:o[2],strings:i,ctor:"."===o[1]?te:"?"===o[1]?ie:"@"===o[1]?re:ee}),r.removeAttribute(e)}else e.startsWith(E)&&(s.push({type:6,index:n}),r.removeAttribute(e));if(W.test(r.tagName)){const e=r.textContent.split(E),t=e.length-1;if(t>0){r.textContent=S?S.emptyScript:"";for(let i=0;i<t;i++)r.append(e[i],L()),K.nextNode(),s.push({type:2,index:++n});r.append(e[t],L())}}}else if(8===r.nodeType)if(r.data===C)s.push({type:2,index:n});else{let e=-1;for(;-1!==(e=r.data.indexOf(E,e+1));)s.push({type:7,index:n}),e+=E.length-1}n++}}static createElement(e,t){const i=R.createElement("template");return i.innerHTML=e,i}}function Y(e,t,i=e,r){if(t===F)return t;let n=void 0!==r?i._$Co?.[r]:i._$Cl;const a=M(t)?void 0:t._$litDirective$;return n?.constructor!==a&&(n?._$AO?.(!1),void 0===a?n=void 0:(n=new a(e),n._$AT(e,i,r)),void 0!==r?(i._$Co??=[])[r]=n:i._$Cl=n),void 0!==n&&(t=Y(e,n._$AS(e,t.values),n,r)),t}class J{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??R).importNode(t,!0);K.currentNode=r;let n=K.nextNode(),a=0,o=0,s=i[0];for(;void 0!==s;){if(a===s.index){let t;2===s.type?t=new X(n,n.nextSibling,this,e):1===s.type?t=new s.ctor(n,s.name,s.strings,this,e):6===s.type&&(t=new ne(n,this,e)),this._$AV.push(t),s=i[++o]}a!==s?.index&&(n=K.nextNode(),a++)}return K.currentNode=R,r}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=V,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Y(this,e,t),M(e)?e===V||null==e||""===e?(this._$AH!==V&&this._$AR(),this._$AH=V):e!==this._$AH&&e!==F&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>H(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==V&&M(this._$AH)?this._$AA.nextSibling.data=e:this.T(R.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Q.createElement(G(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const e=new J(r,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=I.get(e.strings);return void 0===t&&I.set(e.strings,t=new Q(e)),t}k(e){H(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const n of e)r===t.length?t.push(i=new X(this.O(L()),this.O(L()),this,this.options)):i=t[r],i._$AI(n),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}let ee=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,n){this.type=1,this._$AH=V,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=V}_$AI(e,t=this,i,r){const n=this.strings;let a=!1;if(void 0===n)e=Y(this,e,t,0),a=!M(e)||e!==this._$AH&&e!==F,a&&(this._$AH=e);else{const r=e;let o,s;for(e=n[0],o=0;o<n.length-1;o++)s=Y(this,r[i+o],t,o),s===F&&(s=this._$AH[o]),a||=!M(s)||s!==this._$AH[o],s===V?e=V:e!==V&&(e+=(s??"")+n[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===V?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}};class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===V?void 0:e}}class ie extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==V)}}class re extends ee{constructor(e,t,i,r,n){super(e,t,i,r,n),this.type=5}_$AI(e,t=this){if((e=Y(this,e,t,0)??V)===F)return;const i=this._$AH,r=e===V&&i!==V||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==V&&(i===V||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Y(this,e)}}const ae=$.litHtmlPolyfillSupport;ae?.(Q,X),($.litHtmlVersions??=[]).push("3.3.2");const oe=globalThis;let se=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const r=i?.renderBefore??t;let n=r._$litPart$;if(void 0===n){const e=i?.renderBefore??null;r._$litPart$=n=new X(t.insertBefore(L(),e),e,void 0,i??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}};se._$litElement$=!0,se.finalized=!0,oe.litElementHydrateSupport?.({LitElement:se});const le=oe.litElementPolyfillSupport;le?.({LitElement:se}),(oe.litElementVersions??=[]).push("4.2.2");const de=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},ce={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:v},he=(e=ce,t,i)=>{const{kind:r,metadata:n}=i;let a=globalThis.litPropertyMetadata.get(n);if(void 0===a&&globalThis.litPropertyMetadata.set(n,a=new Map),"setter"===r&&((e=Object.create(e)).wrapped=!0),a.set(i.name,e),"accessor"===r){const{name:r}=i;return{set(i){const n=t.get.call(this);t.set.call(this,i),this.requestUpdate(r,n,e,!0,i)},init(t){return void 0!==t&&this.C(r,void 0,e,t),t}}}if("setter"===r){const{name:r}=i;return function(i){const n=this[r];t.call(this,i),this.requestUpdate(r,n,e,!0,i)}}throw Error("Unsupported decorator location: "+r)};function pe(e){return(t,i)=>"object"==typeof i?he(e,t,i):((e,t,i)=>{const r=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),r?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function ue(e){return pe({...e,state:!0,attribute:!1})}const _e=1,fe=3,ge=4,me=e=>(...t)=>({_$litDirective$:e,values:t});let we=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const be=me(class extends we{constructor(e){if(super(e),e.type!==_e||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e)));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const i=e.element.classList;for(const e of this.st)e in t||(i.remove(e),this.st.delete(e));for(const e in t){const r=!!t[e];r===this.st.has(e)||this.nt?.has(e)||(r?(i.add(e),this.st.add(e)):(i.remove(e),this.st.delete(e)))}return F}}),ve="important",ye=" !"+ve,xe=me(class extends we{constructor(e){if(super(e),e.type!==_e||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,i)=>{const r=e[i];return null==r?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?i.removeProperty(e):i[e]=null);for(const e in t){const r=t[e];if(null!=r){this.ft.add(e);const t="string"==typeof r&&r.endsWith(ye);e.includes("-")||t?i.setProperty(e,t?r.slice(0,-11):r,t?ve:""):i[e]=r}}return F}});let $e=null;class ke{}ke.render=function(e,t){$e(e,t)},self.QrCreator=ke,function(e){function t(t,i,r,n){var a={},o=e(r,i);o.u(t),o.J(),n=n||0;var s=o.h(),l=o.h()+2*n;return a.text=t,a.level=i,a.version=r,a.O=l,a.a=function(e,t){return t-=n,!(0>(e-=n)||e>=s||0>t||t>=s)&&o.a(e,t)},a}function i(e,t,i,r,n,a,o,s,l,d){function c(t,i,r,n,o,s,l){t?(e.lineTo(i+s,r+l),e.arcTo(i,r,n,o,a)):e.lineTo(i,r)}o?e.moveTo(t+a,i):e.moveTo(t,i),c(s,r,i,r,n,-a,0),c(l,r,n,t,n,0,-a),c(d,t,n,t,i,a,0),c(o,t,i,r,i,0,a)}function r(e,t,i,r,n,a,o,s,l,d){function c(t,i,r,n){e.moveTo(t+r,i),e.lineTo(t,i),e.lineTo(t,i+n),e.arcTo(t,i,t+r,i,a)}o&&c(t,i,a,a),s&&c(r,i,-a,a),l&&c(r,n,-a,-a),d&&c(t,n,a,-a)}function n(e,n){e:{var a=n.text,o=n.v,s=n.N,l=n.K,d=n.P;for(s=Math.max(1,s||1),l=Math.min(40,l||40);s<=l;s+=1)try{var c=t(a,o,s,d);break e}catch(e){}c=void 0}if(!c)return null;for(a=e.getContext("2d"),n.background&&(a.fillStyle=n.background,a.fillRect(n.left,n.top,n.size,n.size)),o=c.O,l=n.size/o,a.beginPath(),d=0;d<o;d+=1)for(s=0;s<o;s+=1){var h=a,p=n.left+s*l,u=n.top+d*l,_=d,f=s,g=c.a,m=p+l,w=u+l,b=_-1,v=_+1,y=f-1,x=f+1,$=Math.floor(Math.min(.5,Math.max(0,n.R))*l),k=g(_,f),S=g(b,y),A=g(b,f);b=g(b,x);var z=g(_,x);x=g(v,x),f=g(v,f),v=g(v,y),_=g(_,y),p=Math.round(p),u=Math.round(u),m=Math.round(m),w=Math.round(w),k?i(h,p,u,m,w,$,!A&&!_,!A&&!z,!f&&!z,!f&&!_):r(h,p,u,m,w,$,A&&_&&S,A&&z&&b,f&&z&&x,f&&_&&v)}return function(e,t){var i=t.fill;if("string"==typeof i)e.fillStyle=i;else{var r=i.type,n=i.colorStops;if(i=i.position.map(e=>Math.round(e*t.size)),"linear-gradient"===r)var a=e.createLinearGradient.apply(e,i);else{if("radial-gradient"!==r)throw Error("Unsupported fill");a=e.createRadialGradient.apply(e,i)}n.forEach(([e,t])=>{a.addColorStop(e,t)}),e.fillStyle=a}}(a,n),a.fill(),e}var a={minVersion:1,maxVersion:40,ecLevel:"L",left:0,top:0,size:200,fill:"#000",background:null,text:"no text",radius:.5,quiet:0};$e=function(e,t){var i={};Object.assign(i,a,e),i.N=i.minVersion,i.K=i.maxVersion,i.v=i.ecLevel,i.left=i.left,i.top=i.top,i.size=i.size,i.fill=i.fill,i.background=i.background,i.text=i.text,i.R=i.radius,i.P=i.quiet,t instanceof HTMLCanvasElement?(t.width===i.size&&t.height===i.size||(t.width=i.size,t.height=i.size),t.getContext("2d").clearRect(0,0,t.width,t.height),n(t,i)):((e=document.createElement("canvas")).width=i.size,e.height=i.size,i=n(e,i),t.appendChild(i))}}(function(){function e(n,o){function s(e,t){for(var i=-1;7>=i;i+=1)if(!(-1>=e+i||h<=e+i))for(var r=-1;7>=r;r+=1)-1>=t+r||h<=t+r||(c[e+i][t+r]=0<=i&&6>=i&&(0==r||6==r)||0<=r&&6>=r&&(0==i||6==i)||2<=i&&4>=i&&2<=r&&4>=r)}function l(e,i){for(var o=h=4*n+17,l=Array(o),_=0;_<o;_+=1){l[_]=Array(o);for(var f=0;f<o;f+=1)l[_][f]=null}for(c=l,s(0,0),s(h-7,0),s(0,h-7),o=r.G(n),l=0;l<o.length;l+=1)for(_=0;_<o.length;_+=1){f=o[l];var g=o[_];if(null==c[f][g])for(var m=-2;2>=m;m+=1)for(var w=-2;2>=w;w+=1)c[f+m][g+w]=-2==m||2==m||-2==w||2==w||0==m&&0==w}for(o=8;o<h-8;o+=1)null==c[o][6]&&(c[o][6]=0==o%2);for(o=8;o<h-8;o+=1)null==c[6][o]&&(c[6][o]=0==o%2);for(o=r.w(d<<3|i),l=0;15>l;l+=1)_=!e&&1==(o>>l&1),c[6>l?l:8>l?l+1:h-15+l][8]=_,c[8][8>l?h-l-1:9>l?15-l:14-l]=_;if(c[h-8][8]=!e,7<=n){for(o=r.A(n),l=0;18>l;l+=1)_=!e&&1==(o>>l&1),c[Math.floor(l/3)][l%3+h-8-3]=_;for(l=0;18>l;l+=1)_=!e&&1==(o>>l&1),c[l%3+h-8-3][Math.floor(l/3)]=_}if(null==p){for(e=a.I(n,d),o=function(){var e=[],t=0,i={B:function(){return e},c:function(t){return 1==(e[Math.floor(t/8)]>>>7-t%8&1)},put:function(e,t){for(var r=0;r<t;r+=1)i.m(1==(e>>>t-r-1&1))},f:function(){return t},m:function(i){var r=Math.floor(t/8);e.length<=r&&e.push(0),i&&(e[r]|=128>>>t%8),t+=1}};return i}(),l=0;l<u.length;l+=1)_=u[l],o.put(4,4),o.put(_.b(),r.f(4,n)),_.write(o);for(l=_=0;l<e.length;l+=1)_+=e[l].j;if(o.f()>8*_)throw Error("code length overflow. ("+o.f()+">"+8*_+")");for(o.f()+4<=8*_&&o.put(0,4);0!=o.f()%8;)o.m(!1);for(;!(o.f()>=8*_)&&(o.put(236,8),!(o.f()>=8*_));)o.put(17,8);var b=0;for(_=l=0,f=Array(e.length),g=Array(e.length),m=0;m<e.length;m+=1){var v=e[m].j,y=e[m].o-v;for(l=Math.max(l,v),_=Math.max(_,y),f[m]=Array(v),w=0;w<f[m].length;w+=1)f[m][w]=255&o.B()[w+b];for(b+=v,w=r.C(y),v=t(f[m],w.b()-1).l(w),g[m]=Array(w.b()-1),w=0;w<g[m].length;w+=1)y=w+v.b()-g[m].length,g[m][w]=0<=y?v.c(y):0}for(w=o=0;w<e.length;w+=1)o+=e[w].o;for(o=Array(o),w=b=0;w<l;w+=1)for(m=0;m<e.length;m+=1)w<f[m].length&&(o[b]=f[m][w],b+=1);for(w=0;w<_;w+=1)for(m=0;m<e.length;m+=1)w<g[m].length&&(o[b]=g[m][w],b+=1);p=o}for(e=p,o=-1,l=h-1,_=7,f=0,i=r.F(i),g=h-1;0<g;g-=2)for(6==g&&--g;;){for(m=0;2>m;m+=1)null==c[l][g-m]&&(w=!1,f<e.length&&(w=1==(e[f]>>>_&1)),i(l,g-m)&&(w=!w),c[l][g-m]=w,-1==--_&&(f+=1,_=7));if(0>(l+=o)||h<=l){l-=o,o=-o;break}}}var d=i[o],c=null,h=0,p=null,u=[],_={u:function(t){t=function(t){var i=e.s(t);return{S:function(){return 4},b:function(){return i.length},write:function(e){for(var t=0;t<i.length;t+=1)e.put(i[t],8)}}}(t),u.push(t),p=null},a:function(e,t){if(0>e||h<=e||0>t||h<=t)throw Error(e+","+t);return c[e][t]},h:function(){return h},J:function(){for(var e=0,t=0,i=0;8>i;i+=1){l(!0,i);var n=r.D(_);(0==i||e>n)&&(e=n,t=i)}l(!1,t)}};return _}function t(e,i){if(void 0===e.length)throw Error(e.length+"/"+i);var r=function(){for(var t=0;t<e.length&&0==e[t];)t+=1;for(var r=Array(e.length-t+i),n=0;n<e.length-t;n+=1)r[n]=e[n+t];return r}(),a={c:function(e){return r[e]},b:function(){return r.length},multiply:function(e){for(var i=Array(a.b()+e.b()-1),r=0;r<a.b();r+=1)for(var o=0;o<e.b();o+=1)i[r+o]^=n.i(n.g(a.c(r))+n.g(e.c(o)));return t(i,0)},l:function(e){if(0>a.b()-e.b())return a;for(var i=n.g(a.c(0))-n.g(e.c(0)),r=Array(a.b()),o=0;o<a.b();o+=1)r[o]=a.c(o);for(o=0;o<e.b();o+=1)r[o]^=n.i(n.g(e.c(o))+i);return t(r,0).l(e)}};return a}e.s=function(e){for(var t=[],i=0;i<e.length;i++){var r=e.charCodeAt(i);128>r?t.push(r):2048>r?t.push(192|r>>6,128|63&r):55296>r||57344<=r?t.push(224|r>>12,128|r>>6&63,128|63&r):(i++,r=65536+((1023&r)<<10|1023&e.charCodeAt(i)),t.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|63&r))}return t};var i={L:1,M:0,Q:3,H:2},r=function(){function e(e){for(var t=0;0!=e;)t+=1,e>>>=1;return t}var i=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],r={w:function(t){for(var i=t<<10;0<=e(i)-e(1335);)i^=1335<<e(i)-e(1335);return 21522^(t<<10|i)},A:function(t){for(var i=t<<12;0<=e(i)-e(7973);)i^=7973<<e(i)-e(7973);return t<<12|i},G:function(e){return i[e-1]},F:function(e){switch(e){case 0:return function(e,t){return 0==(e+t)%2};case 1:return function(e){return 0==e%2};case 2:return function(e,t){return 0==t%3};case 3:return function(e,t){return 0==(e+t)%3};case 4:return function(e,t){return 0==(Math.floor(e/2)+Math.floor(t/3))%2};case 5:return function(e,t){return 0==e*t%2+e*t%3};case 6:return function(e,t){return 0==(e*t%2+e*t%3)%2};case 7:return function(e,t){return 0==(e*t%3+(e+t)%2)%2};default:throw Error("bad maskPattern:"+e)}},C:function(e){for(var i=t([1],0),r=0;r<e;r+=1)i=i.multiply(t([1,n.i(r)],0));return i},f:function(e,t){if(4!=e||1>t||40<t)throw Error("mode: "+e+"; type: "+t);return 10>t?8:16},D:function(e){for(var t=e.h(),i=0,r=0;r<t;r+=1)for(var n=0;n<t;n+=1){for(var a=0,o=e.a(r,n),s=-1;1>=s;s+=1)if(!(0>r+s||t<=r+s))for(var l=-1;1>=l;l+=1)0>n+l||t<=n+l||(0!=s||0!=l)&&o==e.a(r+s,n+l)&&(a+=1);5<a&&(i+=3+a-5)}for(r=0;r<t-1;r+=1)for(n=0;n<t-1;n+=1)a=0,e.a(r,n)&&(a+=1),e.a(r+1,n)&&(a+=1),e.a(r,n+1)&&(a+=1),e.a(r+1,n+1)&&(a+=1),(0==a||4==a)&&(i+=3);for(r=0;r<t;r+=1)for(n=0;n<t-6;n+=1)e.a(r,n)&&!e.a(r,n+1)&&e.a(r,n+2)&&e.a(r,n+3)&&e.a(r,n+4)&&!e.a(r,n+5)&&e.a(r,n+6)&&(i+=40);for(n=0;n<t;n+=1)for(r=0;r<t-6;r+=1)e.a(r,n)&&!e.a(r+1,n)&&e.a(r+2,n)&&e.a(r+3,n)&&e.a(r+4,n)&&!e.a(r+5,n)&&e.a(r+6,n)&&(i+=40);for(n=a=0;n<t;n+=1)for(r=0;r<t;r+=1)e.a(r,n)&&(a+=1);return i+Math.abs(100*a/t/t-50)/5*10}};return r}(),n=function(){for(var e=Array(256),t=Array(256),i=0;8>i;i+=1)e[i]=1<<i;for(i=8;256>i;i+=1)e[i]=e[i-4]^e[i-5]^e[i-6]^e[i-8];for(i=0;255>i;i+=1)t[e[i]]=i;return{g:function(e){if(1>e)throw Error("glog("+e+")");return t[e]},i:function(t){for(;0>t;)t+=255;for(;256<=t;)t-=255;return e[t]}}}(),a=function(){function e(e,r){switch(r){case i.L:return t[4*(e-1)];case i.M:return t[4*(e-1)+1];case i.Q:return t[4*(e-1)+2];case i.H:return t[4*(e-1)+3]}}var t=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],r={I:function(t,i){var r=e(t,i);if(void 0===r)throw Error("bad rs block @ typeNumber:"+t+"/errorCorrectLevel:"+i);t=r.length/3,i=[];for(var n=0;n<t;n+=1)for(var a=r[3*n],o=r[3*n+1],s=r[3*n+2],l=0;l<a;l+=1){var d=s,c={};c.o=o,c.j=d,i.push(c)}return i}};return r}();return e}());var Se=QrCreator;const Ae=o`:host {
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
}`,ze="wl-austria-fonts";const Ee="#1b1464";var Ce={editor:{add_chip:"Chip hinzufügen",add_icon:"Symbol hinzufügen",date_format_placeholder:"d.m.Y",direction_label:"Fahrtrichtung",direction_not_served:"nicht bedient",direction_note_one_way:"Rückfahrt deaktiviert: {line} endet hier.",direction_unavailable:"Keine Abfahrten in dieser Richtung",entities:"Haltestellen",entity:"Haltestelle",header_amenities:"Symbole in diesem Slot",header_bar_aria:"Stationsanzeige — Seite wählen",header_chips_and_icons:"Textchips (max. {chips}) und Extra-Symbole (max. {icons})",header_left:"Linke Seite",header_pick_side_hint:"Seite antippen, dann unten füllen",header_right:"Rechte Seite",header_side_aria:"Seite der Stationsanzeige",header_slot_empty:"leer",line_active_aria:"Linie {line} aktiv",line_inactive_aria:"Linie {line} inaktiv",lines_empty_means_all:"leer = alle Linien",lines_label:"Linien an dieser Haltestelle",lines_selected:"{n} von {total}",no_lines_hint:"Die Linien erscheinen, sobald diese Haltestelle Abfahrten meldet.",no_lines_title:"Noch keine Linien verfügbar",per_line_direction_aria:"Linie {line}: {direction}",remove_chip_aria:"Chip {chip} entfernen",remove_icon_aria:"Symbol {icon} entfernen",remove_stop:"Haltestelle entfernen",section_board:"Fallblatt-Tafel",section_departure_row:"Abfahrtszeile",section_extras:"Extras",section_extras_hint:"optional",section_footer:"Fußzeile",section_header:"Stationsanzeige",section_header_hint:"Direkt am Balken",section_led_panel:"LED-Anzeige",section_station:"Stationsband",section_walk_time:"Gehzeit zur Haltestelle",show_clock_short:"Uhr",show_date_short:"Datum",show_elevator_short:"Lift",show_escalator_short:"Rolltreppe",show_wc_short:"WC",size_medium:"Mittel",size_regular:"Standard",size_small:"Klein",tab_display:"Anzeige",tab_stop:"Haltestelle",tab_stops:"Haltestellen",tab_tweaks:"Stil",text_placeholder:"z. B. Name der nächsten Station",walk_time_aria:"Gehzeit in Minuten für Linie {line} Richtung {towards}",walk_time_branching_hint:"Gilt für alle Endstationen in dieser Richtung",walk_time_hint:"Blendet Abfahrten aus, die ohne dich abfahren würden. Leer = kein Filter.",walk_time_less_aria:"Gehzeit für Linie {line} verringern",walk_time_more_aria:"Gehzeit für Linie {line} erhöhen",walk_time_placeholder:"–",walk_time_unit:"Minuten"}},Te={no_data:"Keine Abfahrten verfügbar",betriebsschluss:"Betriebsschluss",stale_feed:"Keine aktuellen Daten",stale_feed_detail:"Die Wiener Linien melden für diese Haltestelle veraltete Abfahrtszeiten. Sobald wieder Echtzeitdaten kommen, füllt sich die Anzeige automatisch.",stale_feed_since:"Letzte gemeldete Abfahrt: {time}",stale_feed_partial:"Einzelne Linien melden keine aktuellen Zeiten.",min:"Min",now:"Jetzt",platform_short_rail:"Gleis",platform_short_bus:"Steig",version_update:"Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.",entity_missing:"Sensor {entity} existiert nicht mehr. Wähle einen anderen Sensor oder entferne ihn aus den Haltestellen dieser Karte.",no_entities_picked:"Keine Haltestelle ausgewählt",no_entities_available:"Keine Wiener-Linien-Sensoren gefunden",departures_list:"Kommende Abfahrten",barrier_free_title:"Barrierefrei zugänglich",cooling_title:"Klimatisiert",disturbance_title:"Verkehrsbehinderung gemeldet",stops_ahead_aria_show:"Streckenverlauf für {line} Richtung {towards} anzeigen",stops_ahead_aria_hide:"Streckenverlauf für {line} Richtung {towards} ausblenden",stops_ahead_other_show:"{count} weitere Linien bei {stop} anzeigen",stops_ahead_other_hide:"Weitere Linien bei {stop} ausblenden",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",dir_both:"Beide",traffic_label:"Störung",traffic_until:"Bis",traffic_updated:"aktualisiert",elevator_until:"Bis",open_in_maps:"In Karte öffnen",qr_open:"QR-Code anzeigen",qr_dialog_title:"QR-Code für Haltestelle",qr_dialog_hint:"Mit dem Smartphone scannen — öffnet die Haltestelle in der Karten-App.",qr_dialog_close:"QR-Code schließen",delay_singular:"1 Min. verspätet",delay_plural:"{n} Min. verspätet",devmode_title:"DEV",devmode_traffic_btn:"Störung testen",devmode_elevator_btn:"Aufzug testen",devmode_colors_btn:"Linienfarben",devmode_clear_btn:"Löschen",editor:{accessibility_only:"Nur barrierefreie Abfahrten anzeigen",accessibility_only_requires:"Braucht „Barrierefrei-Symbol anzeigen“.",colors_empty_hint:"Wähle im ersten Reiter Haltestellen aus — ihre Linien erscheinen dann hier.",colors_hint:"Optional. Ohne Überschreibung gilt die offizielle Linienfarbe.",hide_attribution:"Datenquelle ausblenden",hide_attribution_helper:"Wenn aktiv, wird die Quellenangabe ausgeblendet.",hide_header:"Kopfzeile ausblenden",hide_header_helper:"Wenn aktiv, wird die Titelleiste der Karte ausgeblendet.",layout:"Layout mehrerer Haltestellen",layout_requires:"Wirkt erst ab zwei Haltestellen.",layout_stacked:"Gestapelt",layout_tabs:"Reiter",max_departures:"Anzahl Abfahrten pro Haltestelle",pick_color_for_line:"Farbe für Linie {line} wählen",reset_color:"Auf Standard zurücksetzen",reset_color_aria:"Linienfarbe {line} auf Standard zurücksetzen",section_colors:"Linienfarben",section_colors_hint:"überschreibt API-Farbe",section_departure_row_hint:"pro Zeile",section_disruptions:"Störungen & Verspätungen",section_layout:"Aufbau",section_layout_hint:"Struktur",show_accessibility:"Barrierefrei-Symbol anzeigen",show_cooling:"Klimaanlagen-Symbol anzeigen",show_cooling_helper:"Zeigt eine Schneeflocke neben Abfahrten mit klimatisiertem Fahrzeug. Wiener Linien melden das pro Fahrzeug — ältere Garnituren liefern die Angabe nicht.",show_delay:"Verspätungen anzeigen",show_delay_colors:"Verspätungen farblich hervorheben",show_delay_colors_helper:"Färbt die Minutenzahl rot, wenn eine Abfahrt verspätet ist, und grün, wenn sie zu früh kommt.",show_delay_colors_requires:"Braucht „Verspätungen anzeigen“.",show_departures:"Abfahrtsliste anzeigen",show_elevator_info:"Aufzugsausfälle anzeigen",show_hero_metric:"Nächste Abfahrt groß anzeigen",show_platform:"Gleis/Steig anzeigen",show_qr_button:"QR-Code-Schaltfläche anzeigen",show_stops_ahead:"Zwischenstationen anzeigen",show_traffic_info:"Störungen anzeigen",show_type_icon:"Verkehrsmittel-Symbol anzeigen"}},Re={editor:{accessibility_only:"Nur barrierefreie Abfahrten anzeigen",chips:"Zusätzliche Beschriftungen",date_format:"Datumsformat",exit:"Ausgangssymbol",extra_icons:"Zusätzliche Symbole",flicker:"LED-Flackern simulieren",header_exit_accessible:"Stufenloser Ausgang",header_exit_none:"Kein",header_exit_regular:"Ausgang",housing:"LED-Gehäuserahmen anzeigen",housing_helper:"Dunkler Rahmen um die LED-Anzeige mit dezentem Glas-Reflex obenauf.",icon_mdi_door_open:"Offene Tür",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_stairs:"Treppe",line_stripe:"Seitlichen Linienstreifen anzeigen",line_stripe_helper:"4-Pixel-Balken am linken Rand jeder Zeile in der Linienfarbe.",message_text:"Nachricht",message_text_requires:"Braucht „Lauftext anzeigen“.",message_ticker:"Laufschrift",message_ticker_helper:"Zeigt alle 5 Minuten eine eigene Nachricht als Laufschrift über die Anzeige.",platform_side:"Gleis/Steig-Seite",platform_side_auto:"Automatisch (1 = rechts, 2 = links)",platform_side_helper:"Standard folgt der Wiener-Linien-Beschilderung (Gleis 2 links, sonst rechts). Manuell überschreibbar.",platform_side_left:"Immer links",platform_side_requires:"Braucht „Steig anzeigen“.",platform_side_right:"Immer rechts",show_clock:"Uhr-Plakette anzeigen",show_date:"Datums-Plakette anzeigen",show_header:"Stationsanzeige anzeigen",show_header_helper:"Hauptschalter. Einstellungen pro Seite bleiben gespeichert.",show_line_pill:"Linien-Plakette anzeigen",show_line_pill_helper:"Liniencode als gefüllte Plakette in der Linienfarbe statt als schlichter Text.",show_platform:"Steig anzeigen",show_station_name:"Stationsnamen anzeigen",show_unit:"Einheit „min“ anzeigen",show_unit_helper:"Kleines „min“ in Amber-Versalien nach jeder Minutenzahl.",size:"Größe",station_bg:"Stationsschild-Hintergrund",station_bg_black:"Schwarz",station_bg_default:"Standard",station_bg_white:"Weiß",style:"Stil",style_classic:"Klassisch",style_pixel:"Punktmatrix",style_warm:"Warm",text:"Beschriftung",wheelchair_race:"Rollstuhl-Rennen (Easter Egg)"},aria_dismiss_message:"Lauftext schließen",aria_start_race:"Barrierefreiheits-Rennen starten",at_platform:"Einfahrt",barrier_free_title:"Barrierefrei zugänglich",betriebsschluss:"Betriebsschluss",countdown_minutes:"{n} Minuten",departures_list:"Kommende Abfahrten",dir_both:"Beide",dir_h:"Hinfahrt",dir_h_short:"H",dir_r:"Rückfahrt",dir_r_short:"R",entity_missing:"Sensor {entity} existiert nicht mehr. Wähle oben einen anderen Sensor.",gleis:"GLEIS",header:{icon_exit:"Ausgang",icon_exit_access:"Stufenloser Ausgang",icon_wc:"WC",icon_escalator:"Rolltreppe",icon_elevator:"Aufzug",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_door_open:"Offene Tür",icon_mdi_stairs:"Treppe"},no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",no_entity:"Keine Haltestelle ausgewählt",race_finished:"Barrierefreiheits-Rennen beendet",race_starting_in:"Rennen startet in {n}",race_winner_announce:"Rollstuhl {n} gewinnt das Barrierefreiheits-Rennen",stale_feed:"Keine aktuellen Daten",steig:"STEIG",unit_min:"min",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.",version_update:"Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden",via_prefix:"ÜBER"},Le={no_entity:"Keine Haltestelle ausgewählt",no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",betriebsschluss:"Betriebsschluss",stale_feed:"Keine aktuellen Daten",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",gleis:"GLEIS",steig:"STEIG",col_line:"LINIE",col_dest:"RICHTUNG",col_step_free:"STUFENLOS",col_cd:"ANKUNFT",version_update:"Klappanzeige wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.",entity_missing:"Sensor {entity} existiert nicht mehr. Wähle oben einen anderen Sensor.",departures_list:"Kommende Abfahrten",at_platform:"Einfahrt",countdown_minutes:"{n} Minuten",barrier_free_title:"Barrierefrei zugänglich",not_barrier_free_title:"Nicht barrierefrei",unit_min:"min",dir_both:"Beide",header:{icon_exit:"Ausgang",icon_exit_access:"Stufenloser Ausgang",icon_wc:"WC",icon_escalator:"Rolltreppe",icon_elevator:"Aufzug",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_door_open:"Offene Tür",icon_mdi_stairs:"Treppe"},editor:{accessibility_only:"Nur barrierefreie Abfahrten anzeigen",accessibility_only_requires:"Braucht „Rollstuhl-Plakette anzeigen“.",chips:"Zusätzliche Beschriftungen",date_format:"Datumsformat",exit:"Ausgangssymbol",extra_icons:"Zusätzliche Symbole",header_exit_accessible:"Stufenloser Ausgang",header_exit_none:"Kein",header_exit_regular:"Ausgang",hide_attribution:"Datenquelle ausblenden",hide_attribution_helper:"Wenn aktiv, wird die CC-BY-Quellenangabe am unteren Rand der Karte ausgeblendet. Die OGD-Lizenz der Wiener Linien verlangt eine sichtbare Quellenangabe, sofern der Hinweis nicht an anderer Stelle im Dashboard erscheint.",housing:"Gehäuserahmen anzeigen",housing_helper:"Umrahmt die Tafel mit dem Gehäuse inkl. dezenter Innenkante und Schlagschatten. Gehäusefarbe folgt dem HA-Theme (cremefarben im Hellmodus, dunkel im Dunkelmodus). Aus = Tafel sitzt bündig auf dem Dashboard.",icon_mdi_door_open:"Offene Tür",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_stairs:"Treppe",max_rows:"Anzahl Zeilen",max_rows_helper:"Wie viele Abfahrten die Tafel zeigt (1–8). Über alle Haltestellen zusammengeführt, nach Abfahrtszeit sortiert.",show_accessibility:"Rollstuhl-Plakette anzeigen",show_accessibility_helper:"Zeigt eine Rollstuhl-Plakette neben barrierefreien Abfahrten.",show_clock:"Uhr-Plakette anzeigen",show_date:"Datums-Plakette anzeigen",show_header:"Stationsanzeige anzeigen",show_header_helper:"Hauptschalter. Einstellungen pro Seite bleiben gespeichert.",show_line_column:"Linienspalte anzeigen",show_line_column_helper:"Zeigt die Spalte mit dem Liniencode. Ausschalten, wenn die Tafel ohnehin nur eine Linie zeigt.",show_min_unit:"Einheit „min“ anzeigen",show_min_unit_helper:"Kleines „min“ neben der Minutenzahl, wie auf echten Stationstafeln.",show_platform:"Gleis/Steig anzeigen",show_platform_helper:"Fügt jeder Zeile eine eigene Gleis-Plakette zwischen Ziel und Minutenzahl hinzu. Wird nur eingeblendet, wenn mindestens eine sichtbare Zeile einen Gleis-Wert hat.",show_station_name:"Stationsnamen anzeigen",show_station_name_helper:"Farbiges Band mit Stationsname und Uhrzeit am oberen Rand der Karte.",size:"Größe",station_bg:"Hintergrund Stationsschild",station_bg_black:"Schwarz",station_bg_helper:"Standard ist die Farbe der ersten erfassten Linie (z. B. Rot für U1, Orange für U3). Bei mehreren Linien kann eine bestimmte Linie gewählt oder auf Weiß bzw. Schwarz umgestellt werden.",station_bg_line:"Erste Linie",station_bg_white:"Weiß",text:"Beschriftung"}},Me={common:Ce,modern:Te,retro:Re,flap:Le},He={editor:{add_chip:"Add chip",add_icon:"Add icon",date_format_placeholder:"d.m.Y",direction_label:"Direction",direction_not_served:"not served",direction_note_one_way:"Return direction disabled: {line} terminates here.",direction_unavailable:"No departures in this direction",entities:"Stops",entity:"Stop",header_amenities:"Icons in this slot",header_bar_aria:"Station sign — choose a side",header_chips_and_icons:"Text chips (max. {chips}) and extra icons (max. {icons})",header_left:"Left side",header_pick_side_hint:"Tap a side, then fill it in below",header_right:"Right side",header_side_aria:"Station sign side",header_slot_empty:"empty",line_active_aria:"Line {line} active",line_inactive_aria:"Line {line} inactive",lines_empty_means_all:"empty = all lines",lines_label:"Lines at this stop",lines_selected:"{n} of {total}",no_lines_hint:"Lines appear as soon as this stop reports departures.",no_lines_title:"No lines yet",per_line_direction_aria:"Line {line}: {direction}",remove_chip_aria:"Remove chip {chip}",remove_icon_aria:"Remove icon {icon}",remove_stop:"Remove stop",section_board:"Split-flap board",section_departure_row:"Departure row",section_extras:"Extras",section_extras_hint:"optional",section_footer:"Footer",section_header:"Station sign",section_header_hint:"Edit on the bar",section_led_panel:"LED panel",section_station:"Station band",section_walk_time:"Walking time to the stop",show_clock_short:"Clock",show_date_short:"Date",show_elevator_short:"Elevator",show_escalator_short:"Escalator",show_wc_short:"WC",size_medium:"Medium",size_regular:"Standard",size_small:"Small",tab_display:"Display",tab_stop:"Stop",tab_stops:"Stops",tab_tweaks:"Style",text_placeholder:"e.g. name of the next station",walk_time_aria:"Walking time in minutes for line {line} towards {towards}",walk_time_branching_hint:"Applies to every terminus in this direction",walk_time_hint:"Hides departures that would leave without you. Empty = no filter.",walk_time_less_aria:"Decrease walking time for line {line}",walk_time_more_aria:"Increase walking time for line {line}",walk_time_placeholder:"–",walk_time_unit:"minutes"}},De={no_data:"No departures available",betriebsschluss:"End of service",stale_feed:"No live data",stale_feed_detail:"Wiener Linien is sending out-of-date departure times for this stop. Departures return automatically once live data resumes.",stale_feed_since:"Last reported departure: {time}",stale_feed_partial:"Some lines aren't reporting current times.",min:"min",now:"Now",platform_short_rail:"Track",platform_short_bus:"Bay",version_update:"Wiener Linien Austria updated to v{v} — please reload",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor, or remove it from this card's stops.",no_entities_picked:"No stop selected",no_entities_available:"No Wiener Linien sensors found",departures_list:"Upcoming departures",barrier_free_title:"Step-free access",cooling_title:"Air conditioned",disturbance_title:"Traffic disruption reported",stops_ahead_aria_show:"Show stops ahead for {line} towards {towards}",stops_ahead_aria_hide:"Hide stops ahead for {line} towards {towards}",stops_ahead_other_show:"Show {count} more lines at {stop}",stops_ahead_other_hide:"Hide other lines at {stop}",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",dir_both:"Both",traffic_label:"Disruption",traffic_until:"Until",traffic_updated:"updated",elevator_until:"Until",open_in_maps:"Open in maps",qr_open:"Show QR code",qr_dialog_title:"QR code for stop",qr_dialog_hint:"Scan with your phone — opens the stop in your maps app.",qr_dialog_close:"Close QR code",delay_singular:"1 min. late",delay_plural:"{n} min. late",devmode_title:"DEV",devmode_traffic_btn:"Test disruption",devmode_elevator_btn:"Test elevator",devmode_colors_btn:"Line colours",devmode_clear_btn:"Clear",editor:{accessibility_only:"Only show step-free departures",accessibility_only_requires:"Requires “Show accessibility icon”.",colors_empty_hint:"Pick stops on the Stops tab — their lines will show up here.",colors_hint:"Optional. Without an override the official line colour applies.",hide_attribution:"Hide data source",hide_attribution_helper:"When on, the data-source credit is hidden.",hide_header:"Hide header",hide_header_helper:"When on, the card title bar is hidden.",layout:"Multi-stop layout",layout_requires:"Only takes effect with two or more stops.",layout_stacked:"Stacked",layout_tabs:"Tabs",max_departures:"Departures per stop",pick_color_for_line:"Pick colour for line {line}",reset_color:"Reset to default",reset_color_aria:"Reset line colour {line} to default",section_colors:"Line colours",section_colors_hint:"overrides the API colour",section_departure_row_hint:"per row",section_disruptions:"Disruptions & delays",section_layout:"Structure",section_layout_hint:"Layout",show_accessibility:"Show step-free icon",show_cooling:"Show air-conditioning icon",show_cooling_helper:"Shows a snowflake beside departures with an air-conditioned vehicle. Wiener Linien report this per vehicle — older trains and trams don't send it.",show_delay:"Show delays",show_delay_colors:"Colour-code delays",show_delay_colors_helper:"Turns the countdown number red when a departure runs late and green when it runs early.",show_delay_colors_requires:"Requires “Show delays”.",show_departures:"Show departure list",show_elevator_info:"Show elevator outages",show_hero_metric:"Show next departure large",show_platform:"Show platform / track",show_qr_button:"Show QR-code button",show_stops_ahead:"Show intermediate stops",show_traffic_info:"Show disruption alerts",show_type_icon:"Show vehicle-type icon"}},Oe={editor:{accessibility_only:"Only show step-free departures",chips:"Extra labels",date_format:"Date format",exit:"Exit icon",extra_icons:"Extra icons",flicker:"Simulate LED flicker",header_exit_accessible:"Step-free exit",header_exit_none:"None",header_exit_regular:"Exit",housing:"Show LED cabinet frame",housing_helper:"Dark bezel around the LED panel with a subtle glass reflection on top.",icon_mdi_door_open:"Open door",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_stairs:"Stairs",line_stripe:"Show line stripe",line_stripe_helper:"A 4 px coloured bar at the left edge of each row, matched to the line.",message_text:"Message",message_text_requires:"Requires “Show ticker”.",message_ticker:"Scrolling message",message_ticker_helper:"Runs a custom message across the display every 5 minutes.",platform_side:"Platform side",platform_side_auto:"Auto (1 = right, 2 = left)",platform_side_helper:"Default follows Wiener Linien signage (platform 2 on the left, otherwise right). Override manually if needed.",platform_side_left:"Always left",platform_side_requires:"Requires “Show platform”.",platform_side_right:"Always right",show_clock:"Show clock chip",show_date:"Show date chip",show_header:"Show station sign",show_header_helper:"Master switch. Per-side settings are kept.",show_line_pill:"Show line badge",show_line_pill_helper:"Renders the line code as a filled badge in the line colour rather than plain text.",show_platform:"Show platform",show_station_name:"Show station name",show_unit:"Show the “min” unit",show_unit_helper:'Trail each countdown number with a small amber "min" caption.',size:"Size",station_bg:"Station-name background",station_bg_black:"Black",station_bg_default:"Default",station_bg_white:"White",style:"Style",style_classic:"Classic",style_pixel:"Dot matrix",style_warm:"Warm",text:"Sign text",wheelchair_race:"Wheelchair race (easter egg)"},aria_dismiss_message:"Dismiss scrolling message",aria_start_race:"Start accessibility race",at_platform:"Arriving",barrier_free_title:"Step-free access",betriebsschluss:"End of service",countdown_minutes:"{n} minutes",departures_list:"Upcoming departures",dir_both:"Both",dir_h:"Outbound",dir_h_short:"H",dir_r:"Return",dir_r_short:"R",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.",gleis:"PLATF.",header:{icon_exit:"Exit",icon_exit_access:"Step-free exit",icon_wc:"Toilet",icon_escalator:"Escalator",icon_elevator:"Elevator",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_door_open:"Open door",icon_mdi_stairs:"Stairs"},no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",no_entity:"No stop selected",race_finished:"Accessibility race finished",race_starting_in:"Race starting in {n}",race_winner_announce:"Wheelchair {n} wins the accessibility race",stale_feed:"No live data",steig:"BAY",unit_min:"min",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",version_update:"Retro card updated to v{v} — please reload",via_prefix:"VIA"},Pe={no_entity:"No stop selected",no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",betriebsschluss:"End of service",stale_feed:"No live data",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",gleis:"PLATF.",steig:"BAY",col_line:"LINE",col_dest:"DIRECTION",col_step_free:"STEP-FREE",col_cd:"ARRIVAL",version_update:"Flap card updated to v{v} — please reload",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.",departures_list:"Upcoming departures",at_platform:"Arriving",countdown_minutes:"{n} minutes",barrier_free_title:"Step-free access",not_barrier_free_title:"Step-free access not available",unit_min:"min",dir_both:"Both",header:{icon_exit:"Exit",icon_exit_access:"Step-free exit",icon_wc:"Toilet",icon_escalator:"Escalator",icon_elevator:"Elevator",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_door_open:"Open door",icon_mdi_stairs:"Stairs"},editor:{accessibility_only:"Only show step-free departures",accessibility_only_requires:"Requires “Show wheelchair badge”.",chips:"Extra labels",date_format:"Date format",exit:"Exit icon",extra_icons:"Extra icons",header_exit_accessible:"Step-free exit",header_exit_none:"None",header_exit_regular:"Exit",hide_attribution:"Hide data source",hide_attribution_helper:"When on, the CC-BY credit at the bottom of the card is hidden. The Wiener Linien Open Government Data licence requires visible attribution unless you keep the credit elsewhere on the dashboard.",housing:"Show cabinet frame",housing_helper:"Wraps the board in the cabinet with a soft inset bevel and drop shadow. Cabinet colour follows your HA theme (cream on light, dark on dark). When off, the board sits flush against the dashboard.",icon_mdi_door_open:"Open door",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_stairs:"Stairs",max_rows:"Number of rows",max_rows_helper:"How many departures to show on the board (1–8). Merged across all stops, sorted by countdown.",show_accessibility:"Show step-free tile",show_accessibility_helper:"Add a wheelchair pictogram tile next to step-free departures.",show_clock:"Show clock chip",show_date:"Show date chip",show_header:"Show station sign",show_header_helper:"Master switch. Per-side settings are kept.",show_line_column:"Show line column",show_line_column_helper:"Shows the column carrying the line code. Turn it off when the board only ever shows one line.",show_min_unit:'Show "min" caption',show_min_unit_helper:"Small label next to the countdown number, like real station boards.",show_platform:"Show platform / track",show_platform_helper:"Adds a per-row platform tile between the destination and the countdown. Only shown when at least one visible row has a platform value.",show_station_name:"Show station name",show_station_name_helper:"Coloured band with the station name and current time at the top of the card.",size:"Size",station_bg:"Station-name background",station_bg_black:"Black",station_bg_helper:"Default is the colour of the first tracked line (e.g. red for U1, orange for U3). On multi-line boards you can pick a specific line, or override with solid white or black.",station_bg_line:"First line",station_bg_white:"White",text:"Sign text"}},Ne={common:He,modern:De,retro:Oe,flap:Pe};const Ue={de:Object.freeze({__proto__:null,common:Ce,default:Me,flap:Le,modern:Te,retro:Re}),en:Object.freeze({__proto__:null,common:He,default:Ne,flap:Pe,modern:De,retro:Oe})},Be=Ue.de??{};function qe(e,t){const i=function(e,t){return e.split(".").reduce((e,t)=>{if(e&&"object"==typeof e&&t in e)return e[t]},t)}(e,t);return"string"==typeof i?i:void 0}function We(e,t,i){const r=function(e){return"en"===((e.configLanguage||e.hassLanguage||"de").split(/[-_]/)[0]??"de")?"en":"de"}(t);let n=qe(e,Ue[r]??Be);if(void 0===n&&(n=qe(e,Be)),void 0===n)return e;if(i)for(const[e,t]of Object.entries(i))n=n.replace(`{${e}}`,String(t));return n}function je(e,t,i="banner"){if(!e)return V;if(function(e){if(!e)return!1;try{return"1"===window.sessionStorage?.getItem(`wl-reload-attempted-${e}`)}catch{return!1}}(e)){const e=t("version_reload_stuck");return j`
      <div class=${i} role="alert" aria-live="assertive">
        <span>${e}</span>
      </div>
    `}const r=t("version_update").replace("{v}",e),n=t("version_reload");return j`
    <div class=${i} role="alert" aria-live="assertive">
      <span>${r}</span>
      <button
        type="button"
        aria-label=${n}
        @click=${()=>function(e){try{window.caches?.keys?.().then(e=>{e.forEach(e=>window.caches?.delete?.(e))})}catch{}if(e)try{window.sessionStorage?.setItem(`wl-reload-attempted-${e}`,"1")}catch{}window.location.reload()}(e)}
      >
        ${n}
      </button>
    </div>
  `}function Fe(e,t){return e?j`<span lang="de">${e}</span>`:t??""}const Ve="ptMetro";function Ie(e){switch(e){case Ve:return"mdi:subway-variant";case"ptTram":return"mdi:tram";case"ptBusCity":case"ptBusNight":return"mdi:bus";default:return null}}function Ke(e){return!0===e?.themes?.darkMode?"dark":!1===e?.themes?.darkMode?"light":void 0}const Ge=e=>Math.min(1,Math.max(0,e)),Ze=e=>e<=.04045?e/12.92:((e+.055)/1.055)**2.4,Qe=e=>e<=.0031308?12.92*e:1.055*e**(1/2.4)-.055;function Ye(e){const t=e.trim();if(!t||t.includes("var("))return null;let i=/^#[0-9a-f]{3,8}$/i.test(t)?t.slice(1):"";if(!i){let e="";try{const i=document.createElement("span").style;i.color=t,e=i.color.trim()}catch{return null}const i=/^rgba?\(([^)]+)\)$/.exec(e);if(!i?.[1])return null;const r=i[1].split(/[,\s/]+/).filter(Boolean).map(Number),[n,a,o]=r;return void 0===n||void 0===a||void 0===o?null:[n,a,o].every(Number.isFinite)?[Ze(n/255),Ze(a/255),Ze(o/255)]:null}if(3!==i.length&&4!==i.length||(i=[...i.slice(0,3)].map(e=>e+e).join("")),6!==i.length&&8!==i.length)return null;const r=Number.parseInt(i.slice(0,6),16);return Number.isFinite(r)?[Ze((r>>16&255)/255),Ze((r>>8&255)/255),Ze((255&r)/255)]:null}const Je=([e,t,i])=>"#"+[e,t,i].map(e=>Math.round(255*Ge(Qe(e))).toString(16).padStart(2,"0")).join(""),Xe=([e,t,i])=>.2126*e+.7152*t+.0722*i;function et(e,t){if(void 0===t)return null;const i=Ye(e);if(!i)return null;const[r,n,a]=function([e,t,i]){const r=Math.cbrt(.4122214708*e+.5363325363*t+.0514459929*i),n=Math.cbrt(.2119034982*e+.6806995451*t+.1073969566*i),a=Math.cbrt(.0883024619*e+.2817188376*t+.6299787005*i);return[.2104542553*r+.793617785*n-.0040720468*a,1.9779984951*r-2.428592205*n+.4505937099*a,.0259040371*r+.7827717662*n-.808675766*a]}(i),o="dark"===t?Math.max(.72,r):Math.min(.45,r);if(o===r)return Je(i);const s=Math.hypot(n,a),l=Math.atan2(a,n),d=function([e,t,i]){const r=(e+.3963377774*t+.2158037573*i)**3,n=(e-.1055613458*t-.0638541728*i)**3,a=(e-.0894841775*t-1.291485548*i)**3;return[4.0767416621*r-3.3077115913*n+.2309699292*a,-1.2684380046*r+2.6097574011*n-.3413193965*a,-.0041960863*r-.7034186147*n+1.707614701*a]}([o,s*Math.cos(l),s*Math.sin(l)]);return Je([Ge(d[0]),Ge(d[1]),Ge(d[2])])}function tt(e,t){return"boolean"==typeof e?e:t}function it(e){if("string"==typeof e)return e.startsWith("sensor.")?{entity:e}:(console.warn(`[wiener-linien-austria] entities[] entry ${JSON.stringify(e)} is not a sensor.* entity — dropping`),null);if(!e||"object"!=typeof e)return console.warn(`[wiener-linien-austria] entities[] entry ${JSON.stringify(e)} is not a string or object — dropping`),null;const t=e,i="string"==typeof t.entity?t.entity:null;if(!i?.startsWith("sensor."))return console.warn("[wiener-linien-austria] entities[] entry has missing or non-sensor.* entity field",e),null;const r={entity:i};if(Array.isArray(t.lines)){const e=t.lines.filter(e=>"string"==typeof e&&e.length>0);e.length&&(r.lines=e)}"H"!==t.direction&&"R"!==t.direction||(r.direction=t.direction);const n=function(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,r]of Object.entries(e)){if("string"!=typeof i||!i.length)continue;const e=i.toUpperCase();"H"!==r&&"R"!==r?void 0!==r&&""!==r&&"Both"!==r&&console.warn(`[wiener-linien-austria] line_directions["${i}"] = ${JSON.stringify(r)} is not "H" / "R" / "Both" — dropping`):t[e]=r}return Object.keys(t).length?t:void 0}(t.line_directions);n&&(r.line_directions=n);const a=function(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,r]of Object.entries(e)){const e="number"==typeof r?r:"string"==typeof r?Number(r):NaN;if(!Number.isFinite(e)||e<0||e>120){console.warn(`[wiener-linien-austria] walk_times["${i}"] = ${JSON.stringify(r)} is not a finite number in 0..120 — dropping`);continue}const n=i.split("|"),a=n.length>=3?`${n[0]}|${n[1]}`:i,o=Math.round(e),s=t[a];t[a]=void 0===s?o:Math.max(s,o)}return Object.keys(t).length?t:void 0}(t.walk_times);return a&&(r.walk_times=a),r}const rt=new Set(["type","entities","entity","lines","direction","walk_times","max_departures","line_colors","show_accessibility","accessibility_only","show_cooling","show_traffic_info","show_elevator_info","show_delay","show_delay_colors","show_type_icon","show_platform","show_hero_metric","show_departures","show_stops_ahead","show_qr_button","hide_header","hide_attribution","layout"]),nt=6,at=!1,ot=!1,st=!1,lt=!0,dt=!0,ct=!0,ht=!0,pt=!1,ut=!0,_t=!0,ft=!0,gt=!0,mt=!0,wt=!1,bt=!1;function vt(e){let t=[];Array.isArray(e.entities)?t=e.entities:"string"==typeof e.entity&&(t=[{entity:e.entity,lines:e.lines,direction:e.direction,walk_times:e.walk_times}]);const i=[],r=new Set;for(const e of t){const t=it(e);t&&(r.has(t.entity)||(r.add(t.entity),i.push(t)))}const n=Number(e.max_departures),a=Number.isFinite(n)?Math.max(0,Math.min(20,Math.round(n))):nt,o={};if(e.line_colors&&"object"==typeof e.line_colors){const t=/^#(?:[0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;for(const[i,r]of Object.entries(e.line_colors))"string"==typeof r&&t.test(r.trim())&&(o[i.toUpperCase()]=r.trim())}const s=function(e,t){const i={};if(!e||"object"!=typeof e)return i;for(const[r,n]of Object.entries(e))t.has(r)||(i[r]=n);return i}(e,rt);return{...s,type:"string"==typeof e.type&&e.type?e.type:"custom:wiener-linien-austria-card",entities:i,max_departures:a,line_colors:o,show_accessibility:tt(e.show_accessibility,at),accessibility_only:tt(e.accessibility_only,ot),show_cooling:tt(e.show_cooling,st),show_traffic_info:tt(e.show_traffic_info,lt),show_elevator_info:tt(e.show_elevator_info,dt),show_delay:tt(e.show_delay,ct),show_delay_colors:tt(e.show_delay_colors,ht),show_type_icon:tt(e.show_type_icon,pt),show_platform:tt(e.show_platform,ut),show_hero_metric:tt(e.show_hero_metric,_t),show_departures:tt(e.show_departures,ft),show_stops_ahead:tt(e.show_stops_ahead,gt),show_qr_button:tt(e.show_qr_button,mt),hide_header:tt(e.hide_header,wt),hide_attribution:tt(e.hide_attribution,bt),layout:"tabs"===e.layout?"tabs":"stacked"}}function yt(e,t,i={},r="var(--primary-color)"){const n=e.toUpperCase();if(void 0!==t[n])return{background:t[n]};if(/^N\d/.test(n))return{background:Ee,color:"#fef200"};const a=i[e]??i[n];return a?.bg?a.fg?{background:`#${a.bg}`,color:`#${a.fg}`}:{background:`#${a.bg}`}:{background:r}}function xt(e,t,i={},r="var(--primary-color)"){return yt(e,t,i,r).background}function $t(e,t,i={},r,n="var(--primary-color)"){const a=yt(e,t,i,n);return{fill:a.background,ink:a.color,text:et(a.background,r)??void 0}}function kt(e){if(!e)return[];const t=[];for(const[i,r]of Object.entries(e.states??{})){if(!i.startsWith("sensor."))continue;const e=r?.attributes??{};"number"==typeof e.diva&&(Array.isArray(e.departures)&&e.next_by_line&&"object"==typeof e.next_by_line&&t.push(i))}return t.sort(),t}function St(e,t){if(!e||!t)return{};const i=e.states?.[t]?.attributes;return i?.line_colors??{}}function At(e,t){if(!e)return{};for(const i of t){const t=St(e,i);if(Object.keys(t).length)return t}return{}}function zt(e,t){return`${e}|${t}`}function Et(e,t){if(!e.length)return t.full;const i=e.slice(0,3).join(" / "),r=e.length>3?" +"+(e.length-3):"";return`${t.short}: ${i}${r}`}function Ct(e,t){const i=new Set;for(const r of e?.tracked_line_keys??[]){const[e,n]=r.split("|",2);t&&e!==t||("H"!==n&&"R"!==n||i.add(n))}if(0===i.size)for(const r of e?.departures??[])t&&r.line!==t||"H"!==r.direction&&"R"!==r.direction||i.add(r.direction);const r=[...i];return{available:i,unknown:0===i.size,oneWay:1===i.size?r[0]??null:null}}function Tt(e,t){if(0===t.size)return[...e];const i=e.filter(e=>t.has(e));for(const e of t)i.includes(e)||i.push(e);return i}function Rt(e){if(e?.tracked_lines?.length)return[...e.tracked_lines].sort();const t=new Set;if(e?.lines_at_stop?.length)for(const i of e.lines_at_stop)t.add(i);for(const i of e?.departures??[])i.line&&t.add(i.line);return Array.from(t).sort()}function Lt(e,t){const{lines:i,picked:r,lineDirections:n,stopDirection:a}=t,o=e=>n[e]??a,s=function(e){const t=new Map;for(const i of e?.departures??[]){const e=String(i.direction??""),r=zt(i.line,e);let n=t.get(r);n||(n={line:i.line,direction:e,type:i.type,termini:[]},t.set(r,n)),i.towards&&!n.termini.includes(i.towards)&&n.termini.push(i.towards)}const i=Array.from(t.values());return i.sort((e,t)=>e.line===t.line?e.direction.localeCompare(t.direction):e.line.localeCompare(t.line)),i}(e).filter(e=>{if(r.size>0&&!r.has(e.line))return!1;const t=o(e.line);return!t||e.direction===t}),l=new Set(s.map(e=>e.line)),d=Tt(i,r),c=[];for(const e of d){if(l.has(e))continue;const t=o(e);for(const i of t?[t]:["H","R"])c.push({line:e,direction:i,type:"",termini:[]})}return[...s,...c].sort((e,t)=>e.line===t.line?e.direction.localeCompare(t.direction):e.line.localeCompare(t.line))}function Mt(e){return e.replace(/[^A-Za-z0-9_]/g,"_")}function Ht(e,t){const i=new Set(e);return i.has(t)?i.delete(t):i.add(t),i}const Dt=["Voraussichtliche Dauer","Grund"],Ot=/^(Linien?\s+[^:]{1,60}):\s*/,Pt=new RegExp(`${Ot.source}$`),Nt=new RegExp(`^(${Dt.join("|")}):\\s*(.+)$`),Ut=new RegExp(`(?<=\\S)\\s*(?=(?:${Dt.join("|")}):)`,"g"),Bt=[[new RegExp(`^Die\\s+(?:${["Störung","Sperre","Umleitung","Unterbrechung","Behinderung"].join("|")})\\s+dauert\\s+voraussichtlich\\s+bis\\s+(.+)$`,"i"),"Voraussichtliche Dauer"],[/^Grund\s+(?:dafür|hierfür)\s+(?:ist|sind)\s+(?:eine?\s+)?(.+)$/i,"Grund"]];function qt(e){for(const[t,i]of Bt){const r=t.exec(e);if(r?.[1])return{label:i,value:r[1]}}return null}const Wt="mdi:information-outline",jt=[[/bauarbeit|baustelle|gleisbau|bauma(ß|ss)nahme/i,"mdi:excavator"],[/verkehrsunfall|unfall|kollision|zusammensto(ß|ss)/i,"mdi:car-emergency"],[/rettung|sanit(ä|ae)|notarzt/i,"mdi:ambulance"],[/feuerwehr|brand/i,"mdi:fire-truck"],[/polizei/i,"mdi:police-badge"],[/demonstration|kundgebung|veranstaltung|umzug|marathon/i,"mdi:account-group"],[/schnee|\beis|vereis|\bglatt|gl(ä|ae)tte/i,"mdi:snowflake"],[/sturm|unwetter|witterung|gewitter|hitze/i,"mdi:weather-lightning-rainy"],[/gebrechen|defekt|schaden|st(ö|oe)rung|reparatur|erneuerung|instandsetzung|ma(ß|ss)nahme|wartung/i,"mdi:wrench"]];const Ft=/^\d{1,2}[:.]\d{2}(\s*Uhr)?\.?$/i;function Vt(e){const t=e.trim();return t.endsWith(".")?/^\d+\.$/.test(t)?t:t.slice(0,-1):t}function It(e,t){if("Grund"===e){for(const[e,i]of jt)if(e.test(t))return i;return Wt}return"Voraussichtliche Dauer"===e?Ft.test(t.trim())?"mdi:clock-outline":"mdi:calendar-clock":Wt}const Kt=new Set(["P","DIV","LI","UL","OL","TR","H1","H2","H3","H4","H5","H6"]),Gt=new Set(["SCRIPT","STYLE","TEMPLATE","IFRAME","SVG","NOSCRIPT"]);function Zt(e){const t=[];let i=e;const r=Ot.exec(i);r&&(t.push(`${r[1]}:`),i=i.slice(r[0].length));for(const e of i.split(Ut)){const i=e.trim();i&&t.push(i)}return t}function Qt(e){const t=[],i=[],r=new Set;for(const n of function(e){const t=(new DOMParser).parseFromString(e,"text/html"),i=[];let r="";const n=()=>{const e=r.replace(/\s+/g," ").trim();e&&i.push(e),r=""},a=e=>{const t=e.split(/\r?\n/);r+=t[0]??"";for(let e=1;e<t.length;e+=1)n(),r+=t[e]??""},o=e=>{const t=e.childNodes;for(let e=0;e<t.length;e+=1){const i=t[e];if(!i)continue;if(i.nodeType===Node.TEXT_NODE){a(i.nodeValue??"");continue}if(i.nodeType!==Node.ELEMENT_NODE)continue;const r=i.tagName.toUpperCase();Gt.has(r)||("BR"!==r?(o(i),Kt.has(r)&&n()):n())}};return o(t.body),n(),i}(String(e??"")))for(const e of Zt(n)){const n=Nt.exec(e);if(n?.[1]&&n[2]){if(r.has(n[1]))continue;r.add(n[1]);const e=Vt(n[2]);i.push({label:n[1],value:e,icon:It(n[1],e)});continue}const a=qt(e);if(a&&!r.has(a.label)){r.add(a.label);const e=Vt(a.value);i.push({label:a.label,value:e,icon:It(a.label,e)});continue}const o=Pt.exec(e);o?.[1]?t.push({kind:"heading",text:o[1]}):t.push({kind:"para",text:e})}return{blocks:t,facts:i}}function Yt(e,t="de"){if(!e)return"";const i=Date.parse(e);if(!Number.isFinite(i))return e;try{return new Date(i).toLocaleString("en"===t?"en-GB":"de-AT",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"})}catch{return e}}function Jt(e,t){const i=Number.isFinite(e.countdown)?e.countdown:null,r=function(e,t){if(!e||!t)return null;const i=Date.parse(e),r=Date.parse(t);return Number.isFinite(i)&&Number.isFinite(r)?Math.round((r-i)/6e4):null}(e.time_planned,e.time_real);let n="";null!==i&&i<=0?n="now":t.showDelayColors&&null!==r?r>=1?n="late":r<=-1&&(n="early"):n="";return{countdown:i,signedDelay:r,cdState:n,hasFlags:Boolean(e.traffic_jam||t.showAccessibility&&e.barrier_free||t.showCooling&&e.cooling),platform:t.showPlatform&&e.platform?String(e.platform):null}}function Xt(e){return Number.isFinite(e.countdown)?e.countdown:Number.POSITIVE_INFINITY}function ei(e,t){const i=function(e){if(0===e.length)return[];const t=Math.min(...e.map(Xt));return Number.isFinite(t)?t<=0?e.filter(e=>Xt(e)<=0):e.filter(e=>Xt(e)===t):[e[0]]}(e),r=t.showHeroMetric?new Set(i):new Set,n=e.filter(e=>!r.has(e));return{heroGroup:i,heroLead:i[0],rows:n.slice(0,t.maxDepartures)}}const ti=o`:host {
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
}`,ii=o`:host {
--wl-sunken: color-mix(in srgb, var(--primary-text-color) 3%, var(--card-background-color));
--wl-hover: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
--wl-ripple: color-mix(in srgb, var(--primary-color) 14%, transparent);
}`;function ri(e,t,i){return j`
    <div class="wl-tabs" role="tablist">
      ${e.map((r,n)=>j`<button
          type="button"
          class="wl-tab"
          role="tab"
          id=${`wl-tab-${r.key}`}
          aria-selected=${t===r.key?"true":"false"}
          aria-controls=${t===r.key?`wl-panel-${r.key}`:V}
          tabindex=${t===r.key?"0":"-1"}
          @click=${()=>i(r.key)}
          @keydown=${t=>((t,r)=>{const n="ArrowRight"===t.key?1:"ArrowLeft"===t.key?-1:0;if(!n)return;t.preventDefault();const a=(r+n+e.length)%e.length,o=e[a];if(!o)return;i(o.key);const s=t.currentTarget.parentElement,l=s?.children[a];l instanceof HTMLElement&&l.focus()})(t,n)}
        >
          <span class="wl-tab-label">${r.label}</span>
          <span class="wl-tab-underline" aria-hidden="true"></span>
        </button>`)}
    </div>
  `}function ni(e,t){return j`
    <section class="wl-section">
      <header class="wl-section-header">
        <span class="wl-section-title">${e.title}</span>
        ${e.hint?j`<span class="wl-section-hint">${e.hint}</span>`:V}
      </header>
      <div class="wl-section-body">${t}</div>
    </section>
  `}function ai(e){return ni(e,j`<ha-form
      .hass=${e.hass}
      .data=${e.data}
      .schema=${e.schema}
      .computeLabel=${e.computeLabel}
      .computeHelper=${e.computeHelper}
      @value-changed=${t=>{t.stopPropagation(),e.onChange(t.detail.value)}}
    ></ha-form>`)}const oi={},si=me(class extends we{constructor(e){if(super(e),e.type!==fe&&e.type!==_e&&e.type!==ge)throw Error("The `live` directive is not allowed on child or event bindings");if(!(e=>void 0===e.strings)(e))throw Error("`live` bindings can only contain a single expression")}render(e){return e}update(e,[t]){if(t===F||t===V)return t;const i=e.element,r=e.name;if(e.type===fe){if(t===i[r])return F}else if(e.type===ge){if(!!t===i.hasAttribute(r))return F}else if(e.type===_e&&i.getAttribute(r)===t+"")return F;return((e,t=oi)=>{e._$AH=t})(e),t}});function li(e){"Escape"!==e.key&&"Tab"!==e.key&&e.stopPropagation()}function di(e){return{background:e.fill,...e.ink?{"--wl-chip-ink":e.ink}:{}}}const ci=120;function hi(e,t,i){const r=new Set;for(const n of e)n.direction===t&&(i&&n.line!==i||n.towards&&r.add(n.towards));return[...r].sort()}function pi(e,t,i,r){const n=function(e,t){return e?.states?.[t]?.attributes}(e,t.entity),a=!n,o=n?.stop_name||t.entity,s=n?.line_colors??{},l=Ke(e),d=e=>$t(e,i.lineColorOverrides,s,l,"#5b6470"),c=new Set(t.lines??[]),h=Rt(n),p=c.size?[...new Set([...h,...c])].sort():h,u=function(e){const t=[],i=new Set;for(const r of e?.departures??[]){const e=String(r.direction??""),n=`${r.line}|${e}|${r.towards}`;i.has(n)||(i.add(n),t.push({line:r.line,direction:e,towards:r.towards,type:r.type}))}return t.sort((e,t)=>e.line===t.line?e.towards.localeCompare(t.towards):e.line.localeCompare(t.line)),t}(n),_=new Map;for(const e of n?.departures??[])e.line&&e.type&&!_.has(e.line)&&_.set(e.line,e.type);const f=e=>({full:i.t("H"===e?"dir_h":"dir_r"),short:i.t("H"===e?"dir_h_short":"dir_r_short")});return j`
    <section class="wl-section">
      <header class="wl-section-header">
        ${i.total>1?j`<span class="wl-index" aria-hidden="true">${i.index}</span>`:V}
        <span class="wl-section-title">${o}</span>
      </header>
      <div class="wl-stop-body">
        ${a?function(e,t,i){return j`
    <ha-alert alert-type="error">
      ${t.t("entity_missing").replace("{entity}",e.entity)}
      ${i.remove?j`<button
            type="button"
            slot="action"
            class="wl-add"
            @click=${()=>i.remove?.(e.entity)}
          >
            ${t.et("remove_stop")}
          </button>`:V}
    </ha-alert>
  `}(t,i,r):V}
        ${function(e,t,i,r){const{lines:n,picked:a,colorOf:o,typeByLine:s}=r,l=a.size?t.et("lines_selected").replace("{n}",String(a.size)).replace("{total}",String(n.length)):t.et("lines_empty_means_all");return j`
    <div class="wl-group">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${t.et("lines_label")}</span>
        ${n.length?j`<span class="wl-note">${l}</span>`:V}
      </div>
      ${n.length?j`<div class="wl-chips">
            ${n.map(r=>{const n=t.singleLine?a.has(r):0===a.size||a.has(r),l=Ie(s.get(r));return j`<button
                type="button"
                class="wl-chip"
                style=${xe(function(e){return{"--wl-chip-color":e.fill,...e.text?{"--wl-chip-text":e.text}:{},...e.ink?{"--wl-chip-ink":e.ink}:{}}}(o(r)))}
                aria-pressed=${n?"true":"false"}
                aria-label=${t.et(n?"line_active_aria":"line_inactive_aria").replace("{line}",r)}
                @click=${()=>i.toggleLine(e.entity,r)}
              >
                ${l?j`<span class="wl-chip-mode"
                      ><ha-icon icon=${l} aria-hidden="true"></ha-icon
                    ></span>`:V}
                ${r}
              </button>`})}
          </div>`:j`<div class="wl-empty">
            <span class="wl-empty-title">${t.et("no_lines_title")}</span>
            <span class="wl-note">${t.et("no_lines_hint")}</span>
          </div>`}
    </div>
  `}(t,i,r,{lines:p,picked:c,colorOf:d,typeByLine:_})}
        ${!a&&p.length?function(e,t){return!e.singleLine&&Tt(t.lines,t.picked).length>=2}(i,{lines:p,picked:c})?function(e,t,i,r){const{attrs:n,triplets:a,picked:o,lines:s,colorOf:l,dirStrings:d}=r,c=Tt(s,o),h=e.line_directions??{},p=e.direction??null,u=e=>h[e]??p,_=(t,r)=>{const n={};for(const e of c){const i=e===t?r:u(e);i&&(n[e]=i)}for(const[e,t]of Object.entries(h))c.includes(e)||(n[e]=t);i.setDirections(e.entity,{direction:null,lineDirections:n})};return j`
    <div class="wl-group">
      <span class="wl-label">${t.et("direction_label")}</span>
      ${c.map(e=>{const i=Ct(n,e),r=u(e),o=i.available.has("H"),s=i.available.has("R"),c=null!==i.oneWay,h=i.unknown,p=i=>t.et("per_line_direction_aria").replace("{line}",e).replace("{direction}",null===i?t.t("dir_both"):Et(hi(a,i,e),d(i)));return j`
          <div class="wl-override-row">
            <span class="wl-badge" style=${xe(di(l(e)))}
              >${e}</span
            >
            <div class="wl-dirs">
              ${ui({label:d("H").short,active:"H"===r||null===r&&"H"===i.oneWay,disabled:!h&&!o,compact:!0,title:hi(a,"H",e).join(" / ")||t.t("dir_h"),ariaLabel:p("H"),onClick:()=>_(e,"H")})}
              ${ui({label:d("R").short,active:"R"===r||null===r&&"R"===i.oneWay,disabled:!h&&!s,compact:!0,title:hi(a,"R",e).join(" / ")||t.t("dir_r"),ariaLabel:p("R"),onClick:()=>_(e,"R")})}
              ${ui({label:"",icon:"mdi:swap-horizontal",active:null===r&&!c,disabled:c,compact:!0,title:t.t("dir_both"),ariaLabel:p(null),onClick:()=>_(e,null)})}
            </div>
          </div>
        `})}
    </div>
  `}(t,i,r,{attrs:n,triplets:u,picked:c,lines:p,colorOf:d,dirStrings:f}):function(e,t,i,r){const{attrs:n,triplets:a,picked:o,lines:s,dirStrings:l}=r,d=Tt(s,o),c=1===d.length?d[0]:void 0,h=e.direction??null,p=Ct(n,c),u=p.available.has("H"),_=p.available.has("R"),f=null!==p.oneWay,g="H"===h||null===h&&"H"===p.oneWay,m="R"===h||null===h&&"R"===p.oneWay,w=null===h&&!f,b=t=>{const r={};for(const[t,i]of Object.entries(e.line_directions??{}))d.includes(t)||(r[t]=i);i.setDirections(e.entity,{direction:t,lineDirections:r})},v=e=>p.unknown||p.available.has(e)?Et(hi(a,e,c),l(e)):`${l(e).short}: ${t.et("direction_not_served")}`,y=null!==p.oneWay&&1===d.length?t.et("direction_note_one_way").replace("{line}",d[0]??""):"";return j`
    <div class="wl-group">
      <span class="wl-label">${t.et("direction_label")}</span>
      <div class="wl-dirs">
        ${ui({label:v("H"),active:g,disabled:!p.unknown&&!u,title:u||p.unknown?t.t("dir_h"):t.et("direction_unavailable"),onClick:()=>b("H")})}
        ${ui({label:v("R"),active:m,disabled:!p.unknown&&!_,title:_||p.unknown?t.t("dir_r"):t.et("direction_unavailable"),onClick:()=>b("R")})}
        ${t.singleLine?V:ui({label:t.t("dir_both"),active:w,disabled:f,title:f?t.et("direction_unavailable"):t.t("dir_both"),onClick:()=>b(null)})}
      </div>
      ${y?j`<span class="wl-note">${y}</span>`:V}
    </div>
  `}(t,i,r,{attrs:n,triplets:u,picked:c,lines:p,dirStrings:f}):V}
        ${a?V:function(e,t,i,r){const{attrs:n,picked:a,colorOf:o,lines:s,dirStrings:l}=r,d=e.line_directions??{},c=e.direction??null,h=Lt(n,{lines:s,picked:a,lineDirections:d,stopDirection:c});return h.length?j`
    <div class="wl-group wl-divide">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${t.et("section_walk_time")}</span>
        <span class="wl-note">${t.et("walk_time_unit")}</span>
      </div>
      <span class="wl-note">${t.et("walk_time_hint")}</span>
      <div class="wl-walk-list">
        ${h.map(r=>{const n=zt(r.line,r.direction),a=e.walk_times?.[n],s=r.termini.length?r.termini.join(" / "):"H"===r.direction||"R"===r.direction?l(r.direction).full:"",d=t.et("walk_time_aria").replace("{line}",r.line).replace("{towards}",s),c=t=>{const r=(a??0)+t;i.setWalkTime(e.entity,n,r<1?null:Math.min(ci,r))};return j`
            <div class="wl-walk-row">
              <span class="wl-badge" style=${xe(di(o(r.line)))}
                >${r.line}</span
              >
              <span
                class="wl-walk-dest"
                title=${r.termini.length>1?t.et("walk_time_branching_hint"):s}
                >→ ${s}</span
              >
              <span class="wl-stepper">
                <button
                  type="button"
                  class="wl-step-btn"
                  ?disabled=${void 0===a}
                  aria-label=${t.et("walk_time_less_aria").replace("{line}",r.line)}
                  @click=${()=>c(-1)}
                >
                  <ha-icon icon="mdi:minus" aria-hidden="true"></ha-icon>
                </button>
                <input
                  type="number"
                  class="wl-step-value"
                  min=${1}
                  max=${ci}
                  step="1"
                  inputmode="numeric"
                  placeholder=${t.et("walk_time_placeholder")}
                  aria-label=${d}
                  .value=${si(void 0!==a?String(a):"")}
                  @keydown=${li}
                  @keyup=${li}
                  @keypress=${li}
                  @change=${t=>i.setWalkTime(e.entity,n,function(e,t){const i=e.trim(),r=""===i?NaN:Number(i);return""===i||Number.isFinite(r)||console.warn(`[wiener-linien-austria] walk-time "${e}" for ${t} is not a number — clearing`),Number.isFinite(r)&&r>0?Math.min(120,Math.round(r)):null}(t.target.value,`${e.entity}/${n}`))}
                />
                <button
                  type="button"
                  class="wl-step-btn"
                  ?disabled=${(a??0)>=ci}
                  aria-label=${t.et("walk_time_more_aria").replace("{line}",r.line)}
                  @click=${()=>c(1)}
                >
                  <ha-icon icon="mdi:plus" aria-hidden="true"></ha-icon>
                </button>
              </span>
            </div>
          `})}
      </div>
    </div>
  `:V}(t,i,r,{attrs:n,picked:c,colorOf:d,lines:p,dirStrings:f})}
      </div>
    </section>
  `}function ui(e){return j`<button
    type="button"
    class=${be({"wl-dir":!0,"wl-dir--compact":!!e.compact})}
    aria-pressed=${e.active?"true":"false"}
    aria-disabled=${e.disabled?"true":"false"}
    aria-label=${e.ariaLabel??e.label}
    title=${e.title}
    @click=${t=>{e.disabled?t.preventDefault():e.onClick()}}
  >
    ${e.icon?j`<ha-icon icon=${e.icon} aria-hidden="true"></ha-icon>`:e.label}
  </button>`}function _i(e,t){const i=Array.isArray(t)?t.filter(e=>"string"==typeof e&&e.length>0):[],r=new Map(e.map(e=>[e.entity,e]));return i.map(e=>r.get(e)??{entity:e})}
// Lovelace editor for the Wiener Linien Austria modern card (v2 editor system).
let fi=class extends se{constructor(){super(...arguments),this._tab="stops",this._onEntitiesChanged=e=>{e.stopPropagation(),this._config&&this._commit(vt({...this._config,entities:_i(this._config.entities,e.detail.value.entities)}))},this._computeLabel=e=>function(e,t,i){const r=t.et(i);return r!==i?r:e?.localize?.(`ui.panel.lovelace.editor.card.generic.${i}`)||i}(this.hass,this._i18n,e.name),this._computeHelper=e=>{const{et:t}=this._i18n,i=this._config;return function(e,t,i){const r=i?.[t];if(void 0!==r)return r;const n=`${t}_helper`,a=e.et(n);return a===n?void 0:a}(this._i18n,e.name,{...i?.show_accessibility?{}:{accessibility_only:t("accessibility_only_requires")},...i?.show_delay?{}:{show_delay_colors:t("show_delay_colors_requires")},...(i?.entities.length??0)>=2?{}:{layout:t("layout_requires")}})}}setConfig(e){this._config=vt(e)}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_tab"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._config.entities.map(e=>e.entity);return i.some(e=>t.states[e]!==this.hass.states[e])}get _i18n(){return function(e,t){const i={hassLanguage:t};return{t:t=>We(`${e}.${t}`,i),et:t=>{const r=`${e}.editor.${t}`,n=We(r,i);if(n!==r)return n;const a=`common.editor.${t}`,o=We(a,i);return o===a?t:o}}}("modern",this.hass?.language)}_commit(e){var t,i;this._config=e,t="config-changed",i={config:e},this.dispatchEvent(new CustomEvent(t,{detail:i,bubbles:!0,composed:!0}))}_patch(e){this._config&&this._commit(vt({...this._config,...e}))}get _stopCallbacks(){return function(e,t){const i=(i,r)=>{const n=e();n&&t(n.map(e=>e.entity===i?r({...e}):e))};return{toggleLine:(e,t)=>i(e,e=>{const i=new Set(e.lines??[]);return i.has(t)?i.delete(t):i.add(t),i.size?e.lines=[...i]:delete e.lines,e}),setDirections:(e,t)=>i(e,e=>(null===t.direction?delete e.direction:e.direction=t.direction,Object.keys(t.lineDirections).length?e.line_directions=t.lineDirections:delete e.line_directions,e)),setWalkTime:(e,t,r)=>i(e,e=>{const i={...e.walk_times??{}};return null===r?delete i[t]:i[t]=r,Object.keys(i).length?e.walk_times=i:delete e.walk_times,e}),remove:i=>{const r=e();r&&t(r.filter(e=>e.entity!==i))}}}(()=>this._config?.entities,e=>{this._config&&this._commit({...this._config,entities:e})})}render(){if(!this._config)return V;const{et:e}=this._i18n;return j`
      <div class="wl-editor">
        ${ri([{key:"stops",label:e("tab_stops")},{key:"display",label:e("tab_display")},{key:"tweaks",label:e("tab_tweaks")}],this._tab,e=>{this._tab=e})}
        ${t=this._tab,i=this._renderActiveTab(),j`
    <div
      class=${"stops"===t?"wl-panel wl-panel--stops":"wl-panel"}
      role="tabpanel"
      id=${`wl-panel-${t}`}
      aria-labelledby=${`wl-tab-${t}`}
    >
      ${i}
    </div>
  `}
      </div>
    `;var t,i}_renderActiveTab(){switch(this._tab){case"stops":return this._renderStops();case"display":return this._renderDisplay();case"tweaks":return this._renderMisc()}}_renderStops(){const e=this._config,{t:t,et:i}=this._i18n;return j`
      <ha-form
        .hass=${this.hass}
        .data=${{entities:e.entities.map(e=>e.entity)}}
        .schema=${[{name:"entities",required:!0,selector:{entity:{multiple:!0,filter:{domain:"sensor",integration:"wiener_linien_austria"}}}}]}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._onEntitiesChanged}
      ></ha-form>
      ${e.entities.map((r,n)=>pi(this.hass,r,{index:n+1,total:e.entities.length,lineColorOverrides:e.line_colors,t:t,et:i},this._stopCallbacks))}
    `}_renderDisplay(){const e=this._config,{et:t}=this._i18n,i={hass:this.hass,computeLabel:this._computeLabel,computeHelper:this._computeHelper,onChange:e=>this._patch(e)};return j`
      ${ai({...i,title:t("section_layout"),hint:t("section_layout_hint"),data:{layout:e.layout,max_departures:e.max_departures,hide_header:e.hide_header,show_hero_metric:e.show_hero_metric,show_departures:e.show_departures,show_stops_ahead:e.show_stops_ahead,show_qr_button:e.show_qr_button},schema:[{name:"layout",disabled:e.entities.length<2,selector:{select:{mode:"dropdown",options:[{value:"stacked",label:t("layout_stacked")},{value:"tabs",label:t("layout_tabs")}]}}},{name:"max_departures",selector:{number:{min:0,max:20,step:1,mode:"slider"}}},{name:"hide_header",selector:{boolean:{}}},{name:"show_hero_metric",selector:{boolean:{}}},{name:"show_departures",selector:{boolean:{}}},{name:"show_stops_ahead",selector:{boolean:{}}},{name:"show_qr_button",selector:{boolean:{}}}]})}
      ${ai({...i,title:t("section_departure_row"),hint:t("section_departure_row_hint"),data:{show_platform:e.show_platform,show_accessibility:e.show_accessibility,accessibility_only:e.accessibility_only,show_cooling:e.show_cooling,show_type_icon:e.show_type_icon},schema:[{name:"show_platform",selector:{boolean:{}}},{name:"show_accessibility",selector:{boolean:{}}},{name:"accessibility_only",disabled:!e.show_accessibility,selector:{boolean:{}}},{name:"show_cooling",selector:{boolean:{}}},{name:"show_type_icon",selector:{boolean:{}}}]})}
      ${ai({...i,title:t("section_disruptions"),data:{show_traffic_info:e.show_traffic_info,show_elevator_info:e.show_elevator_info,show_delay:e.show_delay,show_delay_colors:e.show_delay_colors},schema:[{name:"show_traffic_info",selector:{boolean:{}}},{name:"show_elevator_info",selector:{boolean:{}}},{name:"show_delay",selector:{boolean:{}}},{name:"show_delay_colors",disabled:!e.show_delay,selector:{boolean:{}}}]})}
    `}_renderMisc(){const e=this._config,{et:t}=this._i18n;return j`
      ${this._renderColors()}
      ${ai({hass:this.hass,title:t("section_footer"),data:{hide_attribution:e.hide_attribution},schema:[{name:"hide_attribution",selector:{boolean:{}}}],computeLabel:this._computeLabel,computeHelper:this._computeHelper,onChange:e=>this._patch(e)})}
    `}_renderColors(){const e=this._config,{et:t}=this._i18n,i=e.entities.map(e=>e.entity),r=function(e,t){const i=new Set;for(const r of t){const t=e?.states?.[r]?.attributes;for(const e of Rt(t))i.add(e)}return Array.from(i).sort()}(this.hass,i),n=At(this.hass,i);return ni({title:t("section_colors"),hint:t("section_colors_hint")},r.length?j`<div class="wl-group">
            <span class="wl-note">${t("colors_hint")}</span>
            ${r.map(i=>{const r=$t(i,e.line_colors,n,Ke(this.hass),"#888888"),a=r.fill,o=a.startsWith("#")?a:"#888888",s=Boolean(e.line_colors[i.toUpperCase()]),l=t("pick_color_for_line").replace("{line}",i);return j`
                <div class="wl-color-row">
                  <span
                    class="wl-badge"
                    style=${xe({background:a,...r.ink?{"--wl-chip-ink":r.ink}:{}})}
                    aria-hidden="true"
                    >${i}</span
                  >
                  <label class="wl-color-field" title=${l}>
                    <span
                      class="wl-swatch"
                      style=${xe({background:o})}
                      aria-hidden="true"
                    ></span>
                    <span class="wl-color-hex">${o.toUpperCase()}</span>
                    <input
                      type="color"
                      class="wl-color-input"
                      .value=${o}
                      aria-label=${l}
                      @input=${e=>this._setLineColor(i,e.target.value)}
                      @change=${e=>this._setLineColor(i,e.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    class="wl-icon-btn"
                    ?disabled=${!s}
                    aria-label=${t("reset_color_aria").replace("{line}",i)}
                    title=${t("reset_color")}
                    @click=${()=>this._resetLineColor(i)}
                  >
                    <ha-icon icon="mdi:restore" aria-hidden="true"></ha-icon>
                  </button>
                </div>
              `})}
          </div>`:j`<div class="wl-empty">
            <span class="wl-empty-title">${t("no_lines_title")}</span>
            <span class="wl-note">${t("colors_empty_hint")}</span>
          </div>`)}_setLineColor(e,t){this._config&&this._commit({...this._config,line_colors:{...this._config.line_colors,[e.toUpperCase()]:t}})}_resetLineColor(e){if(!this._config)return;const t={...this._config.line_colors};delete t[e.toUpperCase()],this._commit({...this._config,line_colors:t})}static{this.styles=[ii,ti]}};var gi;e([pe({attribute:!1})],fi.prototype,"hass",void 0),e([ue()],fi.prototype,"_config",void 0),e([ue()],fi.prototype,"_tab",void 0),fi=e([de("wiener-linien-austria-card-editor")],fi);{const e=window;e.customCards=e.customCards??[],e.customCards.some(e=>"wiener-linien-austria-card"===e.type)||e.customCards.push({type:"wiener-linien-austria-card",name:"Wiener Linien Austria",description:"Abfahrtsmonitor mit Störungen und Aufzugsinfo",preview:!0,getEntitySuggestion:(e,t)=>t.startsWith("sensor.")?"wiener_linien_austria"!==e?.entities?.[t]?.platform?null:{config:{type:"custom:wiener-linien-austria-card",entities:[t]}}:null})}function mi(e){return e===Ve?"platform_short_rail":"platform_short_bus"}const wi=new Map;let bi=class extends se{constructor(){super(...arguments),this._activeTab=0,this._versionMismatch=null,this._expandedTraffic=new Set,this._expandedElevator=new Set,this._expandedRows=new Set,this._expandedTransfers=new Set,this._debugTraffic=[],this._debugElevator=[],this._qrOpenFor=null,this._devPaletteOpen=!1,this._versionCheckDone=!1,this._fallbackWarned=!1,this._resolvedStopsMemo=null,this._nightlineHourMemo=null,this._devTogglePalette=()=>{this._devPaletteOpen=!this._devPaletteOpen},this._devTrafficVariant=0,this._devElevatorVariant=0,this._devTestTraffic=()=>{const e=this._resolveStops(),t=[];for(const i of e)for(const e of this._attrs(i.entity).departures??[])e.line&&e.towards&&t.push(e);const i=this._randomFrom(t),r=i?.line||"U?",n=i?.towards||"Unbekannt",a=new Date,o=gi.DEV_TRAFFIC_SHAPES,s=o[this._devTrafficVariant%o.length];this._devTrafficVariant+=1;const l=s.html(r,n);this._debugTraffic=[...this._debugTraffic,{name:`DEBUG-T-${Date.now()}`,title:`${r}: ${s.label}`,description:l.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim(),description_html:l,location:"Debug-Stelle",related_lines:[r],time_start:new Date(a.getTime()-18e5).toISOString(),time_end:new Date(a.getTime()+108e5).toISOString(),time_created:new Date(a.getTime()-18e5).toISOString(),time_last_update:a.toISOString(),status:"active"}]},this._devTestElevator=()=>{const e=this._resolveStops(),t=this._randomFrom(e);if(!t)return;const i=this._attrs(t.entity),r=i.stop_name||t.entity,n=i.departures??[],a=this._randomFrom(n),o=a?.line||"",s=a?.towards||"Unbekannt",l=new Date,d=[{description:`${o||"U3"} Mittelbahnsteig - Zwischengeschoss Zugang ${r} - Ausgang ${r}`,reason:"Aufzug ist wegen Bauarbeiten bis 03.08.2026 außer Betrieb!"},{description:`${o||"U6"} Bahnsteig Richtung ${s} - Ausgang ${r}`,reason:"An der Instandsetzung wird bereits gearbeitet."},{description:`Ausgang ${r}`,reason:"Der Aufzug steht aus nicht näher bekannter Ursache still."}],c=d[this._devElevatorVariant%d.length];this._devElevatorVariant+=1,this._debugElevator=[...this._debugElevator,{__debug_entity:t.entity,name:`DEBUG-E-${Date.now()}`,station:r,description:c.description,reason:c.reason,status:"außer Betrieb",related_lines:o?[o]:[],time_start:new Date(l.getTime()-27e5).toISOString(),time_end:new Date(l.getTime()+144e5).toISOString()}]},this._devClear=()=>{this._debugTraffic=[],this._debugElevator=[],this._devPaletteOpen=!1}}static{gi=this}setConfig(e){if(!e||"object"!=typeof e)throw new Error("wiener-linien-austria-card: config must be an object");const t=Array.isArray(e.entities),i="string"==typeof e.entity;if(!t&&!i)throw new Error("wiener-linien-austria-card: 'entities' (array) or legacy 'entity' (string) is required");const r=vt(e);if((Array.isArray(e.entities)?e.entities.length:i?1:0)>0&&0===r.entities.length)throw new Error("wiener-linien-austria-card: every configured entity was rejected (must start with `sensor.`) — see browser console for per-entry details");this._config=r,this._expandedRows=new Set,this._expandedTraffic=new Set,this._expandedElevator=new Set,this._expandedTransfers=new Set,this._qrOpenFor=null,this._activeTab=0,this._fallbackWarned=!1,this._debugTraffic=[],this._debugElevator=[]}getCardSize(){const e=this._config?.entities.length??1;return Math.min(12,3+3*e)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:3}}static getConfigElement(){return document.createElement("wiener-linien-austria-card-editor")}static getStubConfig(e){const t=kt(e)[0];return{entities:t?[t]:[],max_departures:6}}connectedCallback(){super.connectedCallback(),function(){if("undefined"==typeof document)return;if(document.getElementById(ze))return;const e=document.createElement("style");e.id=ze,e.textContent='\n@font-face {\n  font-family: "WL Sans";\n  src: url("/wiener-linien-austria/fonts/wl-sans-regular.woff2") format("woff2");\n  font-weight: 400;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Sans";\n  src: url("/wiener-linien-austria/fonts/wl-sans-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Sans Condensed";\n  src: url("/wiener-linien-austria/fonts/wl-sans-condensed-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Mono";\n  src: url("/wiener-linien-austria/fonts/wl-mono-regular.woff2") format("woff2");\n  font-weight: 400;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Mono";\n  src: url("/wiener-linien-austria/fonts/wl-mono-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n',document.head.appendChild(e)}(),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion())}willUpdate(e){if(this._resolvedStopsMemo=null,this._nightlineHourMemo=null,this._config&&(e.has("_config")||e.has("hass"))){const e=this._resolveStops();if(e.length&&this._activeTab>=e.length&&(this._activeTab=0),this._qrOpenFor){const t=new Set(e.map(e=>e.entity));t.has(this._qrOpenFor)||(this._qrOpenFor=null)}}}updated(e){if(!e.has("_qrOpenFor")&&!e.has("hass")&&!e.has("_config"))return;if(!this._qrOpenFor)return;const t=this.renderRoot.querySelector(".qr-panel.expanded .qr-canvas");if(!t)return;const i=t.getAttribute("data-qr-text")??"",r=t.getAttribute("data-qr-rendered-for")??"";i&&i!==r&&(this._renderTintedQr(t),t.setAttribute("data-qr-rendered-for",i))}_renderTintedQr(e){const t=e.closest(".station"),i=t&&getComputedStyle(t).getPropertyValue("--wl-accent").trim()||"#000";for(;e.firstChild;)e.removeChild(e.firstChild);Se.render({text:e.getAttribute("data-qr-text")??"",radius:0,ecLevel:"H",fill:i,background:"#fff",size:220},e);const r=e.querySelector("canvas");if(!(r instanceof HTMLCanvasElement))return void console.error("[wiener-linien-austria-card] QR canvas unavailable");const n=r.getContext("2d");if(!n)return void console.error("[wiener-linien-austria-card] QR canvas unavailable");const a=function(e){switch(e){case"mdi:subway-variant":return"M18,11H13V6H18M16.5,17A1.5,1.5 0 0,1 15,15.5A1.5,1.5 0 0,1 16.5,14A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 16.5,17M11,11H6V6H11M7.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,14A1.5,1.5 0 0,1 9,15.5A1.5,1.5 0 0,1 7.5,17M12,2C7.58,2 4,2.5 4,6V15.5A3.5,3.5 0 0,0 7.5,19L6,20.5V21H18V20.5L16.5,19A3.5,3.5 0 0,0 20,15.5V6C20,2.5 16.42,2 12,2Z";case"mdi:tram":return"M19,16.94V8.5C19,5.71 16.39,5.1 13,5L13.75,3.5H17V2H7V3.5H11.75L11,5C7.86,5.11 5,5.73 5,8.5V16.94C5,18.39 6.19,19.6 7.59,19.91L6,21.5V22H8.23L10.23,20H14L16,22H18V21.5L16.5,20H16.42C18.11,20 19,18.63 19,16.94M12,18.5A1.5,1.5 0 0,1 10.5,17A1.5,1.5 0 0,1 12,15.5A1.5,1.5 0 0,1 13.5,17A1.5,1.5 0 0,1 12,18.5M17,14H7V9H17V14Z";case"mdi:bus":return"M18,11H6V6H18M16.5,17A1.5,1.5 0 0,1 15,15.5A1.5,1.5 0 0,1 16.5,14A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 16.5,17M7.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,14A1.5,1.5 0 0,1 9,15.5A1.5,1.5 0 0,1 7.5,17M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16Z";default:return"M22 7V16C22 16.71 21.62 17.36 21 17.72V19.25C21 19.66 20.66 20 20.25 20H19.75C19.34 20 19 19.66 19 19.25V18H12V19.25C12 19.66 11.66 20 11.25 20H10.75C10.34 20 10 19.66 10 19.25V17.72C9.39 17.36 9 16.71 9 16V7C9 4 12 4 15.5 4S22 4 22 7M13 15C13 14.45 12.55 14 12 14S11 14.45 11 15 11.45 16 12 16 13 15.55 13 15M20 15C20 14.45 19.55 14 19 14S18 14.45 18 15 18.45 16 19 16 20 15.55 20 15M20 7H11V11H20V7M7 9.5C6.97 8.12 5.83 7 4.45 7.05C3.07 7.08 1.97 8.22 2 9.6C2.03 10.77 2.86 11.77 4 12V20H5V12C6.18 11.76 7 10.71 7 9.5Z"}}(e.getAttribute("data-qr-icon")??"mdi:bus-stop"),o=r.width,s=r.height,l=Math.round(.22*o),d=Math.round((o-l)/2),c=Math.round((s-l)/2),h=Math.round(.18*l),p=d-h,u=c-h,_=l+2*h,f=Math.round(.2*l);n.fillStyle="#fff","function"==typeof n.roundRect?(n.beginPath(),n.roundRect(p,u,_,_,f),n.fill()):n.fillRect(p,u,_,_),n.save(),n.translate(d,c),n.scale(l/24,l/24),n.fillStyle=i,n.fill(new Path2D(a)),n.restore()}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_activeTab")||e.has("_versionMismatch")||e.has("_expandedTraffic")||e.has("_expandedElevator")||e.has("_expandedRows")||e.has("_expandedTransfers")||e.has("_qrOpenFor")||e.has("_debugTraffic")||e.has("_debugElevator"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._resolveStops().map(e=>e.entity);return i.some(e=>t.states[e]!==this.hass.states[e])}_lang(){return this.hass?.language?.startsWith("de")?"de":"en"}_t(e,t){return We(`modern.${e}`,{hassLanguage:this.hass?.language},t)}async _checkCardVersion(){try{this._versionMismatch=await async function(e,t,i){if(!e?.callWS)return null;try{const r=await e.callWS({type:t});if(r?.version&&r.version!==i)return r.version}catch{}return null}(this.hass,"wiener_linien_austria/card_version","2.0.0")}catch(e){console.warn("[wiener-linien-austria-card] version probe failed",e)}}_resolveStops(){if(null!==this._resolvedStopsMemo)return this._resolvedStopsMemo;const e=this._computeResolvedStops();return this._resolvedStopsMemo=e,e}_computeResolvedStops(){const e=(this._config?.entities??[]).filter(e=>this.hass?.states?.[e.entity]);if(e.length)return e;const t=kt(this.hass)[0];if(t){if(!this._fallbackWarned&&(this._config?.entities?.length??0)>0){this._fallbackWarned=!0;const e=this._config?.entities.map(e=>e.entity).join(", ");console.warn(`[wiener-linien-austria-card] configured entity "${e}" not in hass.states; falling back to "${t}"`)}return[{entity:t}]}return[]}_attrs(e){return this.hass?.states?.[e]?.attributes??{}}render(){if(!this._config)return V;if(!this.hass)return j`<ha-card><div class="wrap"></div></ha-card>`;const e=this._config,t=this._resolveStops(),i="tabs"===e.layout&&t.length>=2,r=e.hide_attribution?"":t.map(e=>this._attrs(e.entity).attribution).find(e=>"string"==typeof e&&e.length>0)||"Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0";return j`
      <ha-card>
        ${i?this._renderTabs(t,this._activeTab):V}
        <div class="wrap">
          ${je(this._versionMismatch,e=>this._t(e))}
          ${e.show_traffic_info?this._renderTrafficBanner(t):V}
          ${this._renderBody(t,i)}
          ${this._renderFooter(r)}
        </div>
      </ha-card>
    `}_renderFooter(e){const t=this._isDevMode();return e||t?j`
      ${e?j`<div class="foot">
            <span class="timestamp">${e}</span>
          </div>`:V}
      ${t?this._renderDevModePanel():V}
    `:V}_renderBody(e,t){if(!e.length)return this._renderEmpty();if(t){const t=e[this._activeTab]??e[0];return j`${this._renderStop(t,this._activeTab)}`}return j`${e.map(e=>this._renderStop(e))}`}_renderEmpty(){const e=kt(this.hass).length?"no_entities_picked":"no_entities_available";return j`<div class="empty" role="status" aria-live="polite">${this._t(e)}</div>`}_renderTabs(e,t){return j`
      <div class="tabbar">
        <div class="tabs" role="tablist">
        ${e.map((i,r)=>{const n=this._attrs(i.entity),a=n.stop_name||n.friendly_name||i.entity,o=r===t;return j`<button
            type="button"
            role="tab"
            id=${`wl-tab-${r}`}
            aria-controls=${`wl-tabpanel-${r}`}
            class=${be({tab:!0,active:r===t})}
            aria-selected=${o?"true":"false"}
            tabindex=${o?"0":"-1"}
            @click=${()=>this._setActiveTab(r)}
            @keydown=${t=>this._onTabKeydown(t,r,e.length)}
          >${a}</button>`})}
        </div>
        ${this._renderTabActions(e,t)}
      </div>
    `}_renderTabActions(e,t){if(!this._config.hide_header)return V;const i=e[t]??e[0];if(!i)return V;const r=this._attrs(i.entity),n=r.stop_name||r.friendly_name||i.entity,a=this._stopMapUrl(n,r.latitude,r.longitude),o=this._stopGeoUri(n,r.latitude,r.longitude),s=!1!==this._config.show_qr_button,l=s&&null!==o;return a||l?j`<div
      class=${be({"tab-actions":!0,reserved:s})}
    >
      ${this._renderStopActions(i.entity,n,a,l)}
    </div>`:V}_setActiveTab(e){if(!Number.isFinite(e))return;const t=this._resolveStops(),i=Math.max(0,Math.min(t.length-1,Math.floor(e)));if(i===this._activeTab)return;const r=t[this._activeTab]?.entity,n=t[i]?.entity;r&&n&&this._qrOpenFor===r&&(this._qrOpenFor=n),this._activeTab=i}_onTabKeydown(e,t,i){let r=t;switch(e.key){case"ArrowRight":r=(t+1)%i;break;case"ArrowLeft":r=(t-1+i)%i;break;case"Home":r=0;break;case"End":r=i-1;break;default:return}e.preventDefault(),this._setActiveTab(r),this.updateComplete.then(()=>{const e=this.shadowRoot?.querySelectorAll('.tabs [role="tab"]');e?.[r]?.focus()}).catch(e=>{console.warn("[wiener-linien-austria-card] tab focus skipped",e)})}_renderStopHeader(e,t,i,r,n,a,o){return j`<header class="head">
      <span class="icon-tile" aria-hidden="true">
        <ha-icon icon=${n}></ha-icon>
      </span>
      <div class="title-block">
        <h3 class="title">${Fe(t,e.entity)}</h3>
        ${r?.line?j`<p class="subtitle">${Fe(r.towards)}</p>`:V}
      </div>
      ${a||o?j`<div class="head-actions">
            ${this._renderStopActions(e.entity,i,a,o)}
          </div>`:V}
    </header>`}_renderStopActions(e,t,i,r){const n=this._t("open_in_maps"),a=this._t("qr_open");return j`
      ${r?j`<button
            type="button"
            class=${be({"icon-action":!0,"qr-toggle":!0,expanded:this._qrOpenFor===e})}
            title=${a}
            aria-label="${a}: ${t}"
            aria-expanded=${this._qrOpenFor===e?"true":"false"}
            aria-controls="wl-qr-${Mt(e)}"
            @click=${()=>this._toggleQrFor(e)}
          ><ha-icon icon="mdi:qrcode" aria-hidden="true"></ha-icon></button>`:V}
      ${i?j`<a
            class="icon-action"
            href=${i}
            target="_blank"
            rel="noopener noreferrer"
            title=${n}
            aria-label="${n}: ${t}"
          ><ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon></a>`:V}
    `}_renderStopHero(e,t,i,r){return j`<div class="hero-host">
      <div class="hero">
        <div class="hero-time" aria-live="polite" aria-atomic="true">
          <span class="hero-min">${i}</span>
          ${r?j`<span class="hero-unit">${r}</span>`:V}
        </div>
        ${t.flatMap(t=>[this._renderHeroEntry(t,e.entity),this._renderHeroPanelForEntry(t,e.entity)])}
      </div>
    </div>`}_renderStop(e,t){const i=this._attrs(e.entity),r=i.stop_name||i.friendly_name,n=r||e.entity,a=function(e,t){const{lines:i,direction:r,line_directions:n,walk_times:a,accessibility_only:o}=t,s=i&&i.length?new Set(i):null;return e.filter(e=>{if(s&&!s.has(e.line))return!1;const t=n?.[e.line]??r;if(t&&e.direction!==t)return!1;if(a){const t=a[zt(e.line,String(e.direction??""))];if("number"==typeof t&&e.countdown<t)return!1}return!(o&&!e.barrier_free)})}(Array.isArray(i.departures)?i.departures:[],{...e,accessibility_only:this._config.accessibility_only}),o=Array.isArray(i.elevator_info)?i.elevator_info:[],s=this._debugElevator.filter(t=>t.__debug_entity===e.entity),l=[...o,...s],d=this._config.show_elevator_info&&l.length>0,c=this._stopMapUrl(n,i.latitude,i.longitude),h=this._stopGeoUri(n,i.latitude,i.longitude),p=!1!==this._config.show_qr_button&&null!==h,u=!this._config.hide_header||void 0!==t,{heroGroup:_,heroLead:f,rows:g}=ei(a,{showHeroMetric:this._config.show_hero_metric,maxDepartures:this._config.max_departures}),m="number"==typeof i.stale_departures?i.stale_departures:0,w=St(this.hass,e.entity),b=f?xt(f.line||"",this._config.line_colors,w):"var(--primary-color)",v=(y=f?.type,Ie(y)??"mdi:bus-stop");var y;const x=f&&Number.isFinite(f.countdown)?f.countdown:null,$=null===x?"—":x<=0?this._t("now"):String(x),k=null!==x&&x>0?this._t("min"):"",S=et(b,this._colorScheme()),A=void 0!==t;return j`
      <section
        class="station"
        style="--wl-accent: ${b};${S?` --wl-accent-text: ${S};`:""}"
        id=${A?`wl-tabpanel-${t}`:V}
        role=${A?"tabpanel":V}
        aria-labelledby=${A?`wl-tab-${t}`:V}
        tabindex=${A?"0":V}
        aria-label=${n}
      >
        ${this._config.hide_header?V:this._renderStopHeader(e,r,n,f,v,c,p)}
        ${p&&h&&u?this._renderQrPanel(e.entity,n,h,v,this._qrOpenFor===e.entity):V}

        ${this._config.show_hero_metric&&f?this._renderStopHero(e,_,$,k):V}
        ${d?this._renderElevatorDetails(l):V}
        ${this._config.show_departures&&this._config.max_departures>0?g.length?j`${m>0?j`<div class="stale-note" role="status" aria-live="polite">
                      ${this._t("stale_feed_partial")}
                    </div>`:V}
                <ul class="dep-list" role="list" aria-label=${this._t("departures_list")}>
                  ${g.map((t,i)=>this._renderRow(t,e.entity,i))}
                </ul>`:this._renderEmptyState(i,m):V}
      </section>
    `}_renderEmptyState(e,t){if(t>0){const t=e.stale_since?Yt(e.stale_since,this._lang()):"";return j`<div class="empty stale" role="status" aria-live="polite">
        <div class="empty-title">${this._t("stale_feed")}</div>
        <div class="empty-detail">${this._t("stale_feed_detail")}</div>
        ${t?j`<div class="empty-meta">
              ${this._t("stale_feed_since",{time:t})}
            </div>`:V}
      </div>`}return j`<div class="empty" role="status" aria-live="polite">
      ${this._t(e.server_time?"betriebsschluss":"no_data")}
    </div>`}_renderElevatorDetails(e){return j`
      <div class="alert-list">
        ${e.map(e=>this._renderElevatorDetail(e))}
      </div>
    `}_renderElevatorDetail(e){const t=e.description||e.station||"",i=function(e){return e.split(/\s+-\s+/).map(e=>e.trim().replace(/\.$/,"")).filter(Boolean)}(t),r=e.reason||"",n=function(e){for(const[t,i]of jt)if(t.test(e))return i;return Wt}(r),a=Yt(e.time_end,this._lang()),o=Boolean(r||a),s=this._expandedElevator.has(e.name);return j`
      <div
        class=${be({alert:!0,expanded:s,"no-detail":!o})}
        role=${o?"button":"group"}
        tabindex=${o?"0":"-1"}
        aria-expanded=${o?s?"true":"false":V}
        aria-label=${t}
        @click=${()=>o&&this._toggleElevator(e.name)}
        @keydown=${t=>this._onExpanderKeydown(t,o,()=>this._toggleElevator(e.name))}
      >
        <ha-icon icon="mdi:elevator-passenger-off" aria-hidden="true"></ha-icon>
        <div class="alert-body">
          <div class="alert-summary">
            <div class="alert-title">
              <span lang="de" class="lift-path"
                >${i.map((e,t)=>j`${t?j`<span class="lift-path-sep" aria-hidden="true">›</span>`:V}<span>${e}</span>`)}</span
              >
            </div>
          </div>
          ${o?j`<div class="alert-detail">
                <div class="alert-detail-inner">
                  ${r?j`<div class="alert-desc lift-reason">
                        <ha-icon icon=${n} aria-hidden="true"></ha-icon>
                        <span lang="de">${r}</span>
                      </div>`:V}
                  ${a?j`<div class="alert-meta">
                        <span>${this._t("elevator_until")} ${a}</span>
                      </div>`:V}
                </div>
              </div>`:V}
        </div>
        ${o?j`<ha-icon class="alert-chevron" icon="mdi:chevron-down" aria-hidden="true"></ha-icon>`:V}
      </div>
    `}_toggleElevator(e){this._expandedElevator=Ht(this._expandedElevator,e)}_onExpanderKeydown(e,t,i){t&&("Enter"!==e.key&&" "!==e.key||(e.preventDefault(),i()))}_renderTrafficBanner(e){const t=new Set,i=[];for(const r of e)for(const e of this._attrs(r.entity).traffic_info??[])t.has(e.name)||(t.add(e.name),i.push(e));for(const e of this._debugTraffic)t.has(e.name)||(t.add(e.name),i.push(e));if(!i.length)return V;const r=At(this.hass,this._config.entities.map(e=>e.entity));return j`
      <div class="alert-list">
        ${i.map(e=>this._renderTrafficItem(e,r))}
      </div>
    `}_renderTrafficNotice(e){const t=e.blocks.reduce((e,t)=>"heading"===t.kind?e+1:e,0),i=t>1?e.blocks:e.blocks.filter(e=>"heading"!==e.kind);return j`
      <div class="alert-desc" lang="de">
        ${i.map(e=>"heading"===e.kind?j`<p class="alert-desc-heading">${e.text}</p>`:j`<p>${e.text}</p>`)}
        ${e.facts.length?j`<dl class="alert-facts">
              ${e.facts.map(e=>j`<div class="alert-fact">
                  <dt>
                    <ha-icon icon=${e.icon} aria-hidden="true"></ha-icon>${e.label}
                  </dt>
                  <dd>${e.value}</dd>
                </div>`)}
            </dl>`:V}
      </div>
    `}_renderTrafficItem(e,t){const i=this._config.line_colors,r=Array.isArray(e.related_lines)?e.related_lines:[],n=Qt(e.description_html||e.description||""),a=n.blocks.length>0||n.facts.length>0,o=Yt(e.time_end,this._lang()),s=Yt(e.time_last_update,this._lang()),l=Yt(e.time_created,this._lang()),d=s&&s!==l?s:"",c=Boolean(e.location||o||d),h=Boolean(a||c),p=this._expandedTraffic.has(e.name),u={alert:!0,expanded:p,"no-detail":!h},_=e.title||this._t("traffic_label");return j`
      <div
        class=${be(u)}
        role=${h?"button":"group"}
        tabindex=${h?"0":"-1"}
        aria-expanded=${h?p?"true":"false":V}
        aria-label=${_}
        @click=${()=>h&&this._toggleTraffic(e.name)}
        @keydown=${t=>this._onExpanderKeydown(t,h,()=>this._toggleTraffic(e.name))}
      >
        <ha-icon icon="mdi:alert-octagon" aria-hidden="true"></ha-icon>
        <div class="alert-body">
          <div class="alert-summary">
            ${r.length?j`<div class="alert-lines">
                  ${r.map(e=>j`<span
                      class="alert-line-badge"
                      style=${xe(yt(e,i,t))}
                    >${e}</span>`)}
                </div>`:V}
            <div class="alert-title">${e.title?Fe(e.title):this._t("traffic_label")}</div>
          </div>
          ${h?j`<div class="alert-detail">
                <div class="alert-detail-inner">
                  ${a?this._renderTrafficNotice(n):V}
                  ${c?j`<div class="alert-meta">
                        ${e.location?j`<span class="alert-location-chip">
                              <ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon>${Fe(e.location)}
                            </span>`:V}
                        ${o?j`<span>${this._t("traffic_until")} ${o}</span>`:V}
                        ${d?j`<span>${this._t("traffic_updated")} ${d}</span>`:V}
                      </div>`:V}
                </div>
              </div>`:V}
        </div>
        ${h?j`<ha-icon class="alert-chevron" icon="mdi:chevron-down" aria-hidden="true"></ha-icon>`:V}
      </div>
    `}_toggleTraffic(e){this._expandedTraffic=Ht(this._expandedTraffic,e)}_expandState(e,t,i){const r=function(e,t){return!1!==e&&Array.isArray(t.stops_ahead)&&t.stops_ahead.length>0}(this._config.show_stops_ahead,e),n=this._rowKey(e,t),a=r&&this._expandedRows.has(n),o=a?"stops_ahead_aria_hide":"stops_ahead_aria_show";return{hasStopsAhead:r,rowKey:n,expanded:a,panelId:this._panelId(e,t,i),ariaLabel:r?this._t(o,{line:e.line||"?",towards:e.towards||""}):""}}_renderStopsAheadInner(e,t,i,r){const n=this._config.line_colors,a=St(this.hass,r);return j`
      <ol
        class="stops-ahead"
        style=${xe({"--stops-ahead-line":xt(t,n,a)})}
      >
        ${e.map((e,t)=>this._renderStopAhead(e,t,i,n,a))}
      </ol>
    `}_renderHeroEntry(e,t){const i=yt(e.line||"",this._config.line_colors,St(this.hass,t)),r=this._config.show_platform&&e.platform?String(e.platform):null,n=!!e.barrier_free&&this._config.show_accessibility,a=!!e.cooling&&this._config.show_cooling,o=this._config.show_type_icon?Ie(e.type):null,{hasStopsAhead:s,rowKey:l,expanded:d,panelId:c,ariaLabel:h}=this._expandState(e,t,"hero"),p={"hero-entry":!0,expandable:s,expanded:d},u=e.line||"?";return j`
      <div
        class=${be(p)}
        style=${s?`--stops-ahead-line: ${i.background};`:V}
        role=${s?"button":V}
        tabindex=${s?"0":V}
        aria-expanded=${s?d?"true":"false":V}
        aria-controls=${s?c:V}
        aria-label=${s?h:V}
        @click=${()=>s&&this._toggleRow(l)}
        @keydown=${e=>this._onExpanderKeydown(e,s,()=>this._toggleRow(l))}
      >
        <span
          class="line-badge"
          style=${xe(i)}
        >${u}</span>
        ${o?j`<ha-icon
              class="type-icon"
              icon=${o}
              aria-hidden="true"
            ></ha-icon>`:V}
        <span class="hero-direction">${Fe(e.towards)}</span>
        ${r?j`<span class="hero-platform"
              >${this._t(mi(e.type))} ${r}</span
            >`:V}
        ${n?j`<span
              class="hero-a11y"
              role="img"
              aria-label=${this._t("barrier_free_title")}
              title=${this._t("barrier_free_title")}
            >
              <ha-icon
                icon="mdi:wheelchair-accessibility"
                aria-hidden="true"
              ></ha-icon>
            </span>`:V}
        ${a?j`<span
              class="hero-cooling"
              role="img"
              aria-label=${this._t("cooling_title")}
              title=${this._t("cooling_title")}
            >
              <ha-icon icon="mdi:snowflake" aria-hidden="true"></ha-icon>
            </span>`:V}
        ${s?j`<ha-icon
              class="hero-chevron"
              icon="mdi:chevron-down"
              aria-hidden="true"
            ></ha-icon>`:V}
      </div>
    `}_renderHeroPanelForEntry(e,t){const{hasStopsAhead:i,rowKey:r,expanded:n,panelId:a}=this._expandState(e,t,"hero");return i?this._renderStopsAheadPanel("hero",e.stops_ahead,a,n,e.line||"?",r,t):V}_renderStopsAheadPanel(e,t,i,r,n,a,o){const s="hero"===e?"hero-detail":"dep-row-detail",l=be({[s]:!0,expanded:r}),d=r?"false":"true",c=j`
      <div class="${s}-inner">
        ${this._renderStopsAheadInner(t,n,a,o)}
      </div>
    `;return"hero"===e?j`<div
          class=${l}
          id=${i}
          role="region"
          aria-hidden=${d}
        >
          ${c}
        </div>`:j`<li class=${l} id=${i} role="region" aria-hidden=${d}>
          ${c}
        </li>`}_colorScheme(){return Ke(this.hass)}_rowAccentText(e){const t=this._colorScheme();return void 0===t?null:et(e,t)??"var(--primary-text-color)"}_renderRow(e,t,i=0){const r=this._config.line_colors,n=St(this.hass,t),a=e.line||"?",o=yt(a,r,n),{countdown:s,signedDelay:l,cdState:d,hasFlags:c,platform:h}=Jt(e,{showDelayColors:this._config.show_delay_colors,showAccessibility:this._config.show_accessibility,showCooling:this._config.show_cooling,showPlatform:this._config.show_platform}),p=this._config.show_accessibility,u=this._config.show_cooling,_=null===s?"—":s<=0?this._t("now"):`${s} ${this._t("min")}`,f=this._config.show_delay&&null!==l&&l>=1?1===l?this._t("delay_singular"):this._t("delay_plural",{n:l}):"",g="now"===d?this._rowAccentText(o.background):null,m=this._config.show_type_icon?Ie(e.type):null,{hasStopsAhead:w,rowKey:b,expanded:v,panelId:y,ariaLabel:x}=this._expandState(e,t,"row"),$=j`
      <li
        class=${be({"dep-row":!0,expandable:w,expanded:v})}
        style=${`--row-i: ${i};${g?` --wl-accent-text: ${g};`:""}${w?` --stops-ahead-line: ${o.background};`:""}`}
        role=${w?"button":V}
        tabindex=${w?"0":V}
        aria-expanded=${w?v?"true":"false":V}
        aria-controls=${w?y:V}
        aria-label=${w?x:V}
        @click=${()=>w&&this._toggleRow(b)}
        @keydown=${e=>this._onExpanderKeydown(e,w,()=>this._toggleRow(b))}
      >
        <div class="line-badge" style=${xe(o)}>${a}</div>
        <div class="towards">
          ${m?j`<ha-icon class="type-icon" icon=${m} aria-hidden="true"></ha-icon>`:V}
          <div class="towards-rows">
            <span class="towards-name">${Fe(e.towards)}</span>${f?j`<span class="delay">${f}</span>`:V}
          </div>
        </div>
        ${h||c?j`<span class="row-end">
              ${h?j`<span class="row-platform"
                    >${this._t(mi(e.type))} ${h}</span
                  >`:V}
              ${c?j`<span class="row-flags">
                    ${e.traffic_jam?j`<ha-icon
                          class="disturbance"
                          icon="mdi:alert-circle"
                          role="img"
                          aria-label=${this._t("disturbance_title")}
                          title=${this._t("disturbance_title")}
                        ></ha-icon>`:V}
                    ${p&&e.barrier_free?j`<ha-icon
                          class="a11y"
                          icon="mdi:wheelchair-accessibility"
                          role="img"
                          aria-label=${this._t("barrier_free_title")}
                          title=${this._t("barrier_free_title")}
                        ></ha-icon>`:V}
                    ${u&&e.cooling?j`<ha-icon
                          class="cooling"
                          icon="mdi:snowflake"
                          role="img"
                          aria-label=${this._t("cooling_title")}
                          title=${this._t("cooling_title")}
                        ></ha-icon>`:V}
                  </span>`:V}
            </span>`:j`<span></span>`}
        <!-- Conditional spread avoids classMap({ "": true }) when cdState is "". -->
        <div class=${be({countdown:!0,...d?{[d]:!0}:{}})}>${_}</div>
        ${w?j`<ha-icon
              class="row-chevron"
              icon="mdi:chevron-down"
              aria-hidden="true"
            ></ha-icon>`:V}
      </li>
    `;return w?[$,this._renderStopsAheadPanel("row",e.stops_ahead,y,v,a,b,t)]:$}_renderStopAhead(e,t,i,r,n){const a=e.lines??[],o=this._isNightlineHour(),s=[],l=[];for(const e of a)/^U\d/.test(e)||o&&/^N\d/.test(e)?s.push(e):l.push(e);const d=this._transferKey(i,t),c=this._expandedTransfers.has(d),h={"stops-ahead-stop":!0,terminus:!!e.is_terminus,"transfers-expanded":c},p=s.length?j`<span class="stops-ahead-metros">
          ${s.map(e=>j`<span
              class="stops-ahead-line-chip"
              style=${xe(yt(e,r,n))}
              >${e}</span
            >`)}
        </span>`:V,u=l.length?j`<button
          type="button"
          class="stops-ahead-other-toggle"
          aria-expanded=${c?"true":"false"}
          aria-label=${this._t(c?"stops_ahead_other_hide":"stops_ahead_other_show",{count:l.length,stop:e.name})}
          @click=${e=>{e.stopPropagation(),this._toggleTransfers(d)}}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||e.stopPropagation()}}
        >
          <span class="stops-ahead-other-count">+${l.length}</span>
          <ha-icon icon="mdi:chevron-down" aria-hidden="true"></ha-icon>
        </button>`:V,_=l.length&&c?j`<div class="stops-ahead-others">
            ${l.map(e=>j`<span
                class="stops-ahead-line-chip stops-ahead-line-chip--other"
                style=${xe(yt(e,r,n))}
                >${e}</span
              >`)}
          </div>`:V,f=l.length>0,g=f?this._t(c?"stops_ahead_other_hide":"stops_ahead_other_show",{count:l.length,stop:e.name}):"";return j`
      <li class=${be(h)}>
        <div
          class="stops-ahead-row"
          role=${f?"button":V}
          tabindex=${f?"0":V}
          aria-expanded=${f?c?"true":"false":V}
          aria-label=${f?g:V}
          @click=${f?e=>{e.stopPropagation(),this._toggleTransfers(d)}:V}
          @keydown=${f?e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),e.stopPropagation(),this._toggleTransfers(d))}:V}
        >
          <span class="stops-ahead-dot" aria-hidden="true"></span>
          <span class="stops-ahead-name">${Fe(e.name)}</span>
          ${p} ${u}
        </div>
        ${_}
      </li>
    `}_toggleTransfers(e){this._expandedTransfers=Ht(this._expandedTransfers,e)}_isNightlineHour(){if(null!==this._nightlineHourMemo)return this._nightlineHourMemo;const e=function(e){let t=wi.get(e);return t||(t=new Intl.DateTimeFormat("en-GB",{timeZone:e,hour:"2-digit",minute:"2-digit",hour12:!1}),wi.set(e,t)),t}("Europe/Vienna").formatToParts(new Date),t=Number(e.find(e=>"hour"===e.type)?.value??"0"),i=Number(e.find(e=>"minute"===e.type)?.value??"0"),r=60*t+i,n=r>=1435||r<=315;return this._nightlineHourMemo=n,n}_rowKey(e,t){const i=e.time_planned??`cd${e.countdown}`;return`${t}|${e.line}|${e.direction}|${e.towards??""}|${i}`}_panelId(e,t,i){const r=Mt(t),n="hero"===i?"wl-hero-stopsahead":"wl-stopsahead",a=(e.time_planned??`cd${e.countdown}`).replace(/[^a-z0-9_-]/gi,"_");return`${n}-${r}-${e.line}-${e.direction}-${a}`}_toggleRow(e){this._expandedRows=Ht(this._expandedRows,e)}_transferKey(e,t){return`${e}|${t}`}_stopMapUrl(e,t,i){let r=null;return"number"==typeof t&&"number"==typeof i?r=`https://stadtplan.wien.gv.at/#/@${i},${t},17.5,0,0,standard/themes`:e&&(r=`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${e}, Wien`)}`),r?("string"!=typeof(n=r)?"":/^https?:\/\//i.test(n)?n:"")||null:null;var n}_stopGeoUri(e,t,i){if("number"!=typeof t||"number"!=typeof i)return null;return`geo:${t},${i}?q=${t},${i}${e?`(${encodeURIComponent(e)})`:""}`}_toggleQrFor(e){this._qrOpenFor=this._qrOpenFor===e?null:e}_renderQrPanel(e,t,i,r,n){const a=`wl-qr-${Mt(e)}`,o=this._t("qr_dialog_title"),s=this._t("qr_dialog_hint");return j`
      <div
        class=${be({"qr-panel":!0,expanded:n})}
        id=${a}
        role="region"
        aria-hidden=${n?"false":"true"}
        aria-label="${o}: ${t}"
      >
        <div class="qr-panel-inner">
          <div
            class="qr-panel-body"
            role="button"
            tabindex=${n?"0":"-1"}
            aria-label=${this._t("qr_dialog_close")}
            @click=${()=>this._toggleQrFor(e)}
            @keydown=${t=>this._onExpanderKeydown(t,!0,()=>this._toggleQrFor(e))}
          >
            <div
              class="qr-canvas"
              role="img"
              aria-label="${o}: ${t}"
              data-qr-text=${i}
              data-qr-icon=${r}
            ></div>
            <p class="qr-panel-hint">${s}</p>
          </div>
        </div>
      </div>
    `}_isDevMode(){try{if((window.location.search||"").includes("wl_debug=1"))return!0;if("1"===window.localStorage?.getItem("wl_debug"))return!0}catch(e){console.warn("[wiener-linien-austria-card] dev-mode probe failed (SSR/restricted ctx?)",e)}return!1}_renderDevModePanel(){return this._isDevMode()?j`
      <div class="dev-strip">
        <span class="dev-strip-label">${this._t("devmode_title")}</span>
        <button type="button" @click=${this._devTestTraffic}>${this._t("devmode_traffic_btn")}</button>
        <button type="button" @click=${this._devTestElevator}>${this._t("devmode_elevator_btn")}</button>
        <button
          type="button"
          aria-expanded=${this._devPaletteOpen?"true":"false"}
          @click=${this._devTogglePalette}
        >
          ${this._t("devmode_colors_btn")}
        </button>
        <button type="button" class="dev-strip-clear" @click=${this._devClear}>
          ${this._t("devmode_clear_btn")}
        </button>
      </div>
      ${this._devPaletteOpen?this._renderDevPalette():V}
    `:V}static{this.DEV_GROUNDS={dark:"#1c1c1c",light:"#ffffff"}}static{this.DEV_SURFACES=[{label:"hero",ratio:.12},{label:"row",ratio:.06}]}static{this.DEV_PALETTE=[{label:"U1",hex:"#E3000F"},{label:"U2",hex:"#A862A4"},{label:"U3",hex:"#EF7C00"},{label:"U4",hex:"#319F49"},{label:"U6",hex:"#9D6830"},{label:"Tram",hex:"#C00808"},{label:"Bus",hex:"#0A295D"},{label:"Nightline",hex:Ee},{label:"Badner Bahn",hex:"#000000"},{label:"Weiß",hex:"#FFFFFF"}]}_devPaletteEntries(){const e=gi.DEV_PALETTE.map(e=>({...e,live:!1})),t=new Set(e.map(e=>e.hex.toUpperCase())),i=At(this.hass,(this._config?.entities??[]).map(e=>e.entity));for(const[r,n]of Object.entries(i)){if(!n?.bg)continue;const i=`#${n.bg}`.toUpperCase();t.has(i)||(t.add(i),e.push({label:r,hex:i,live:!0}))}return e}_renderDevPalette(){return j`
      <div class="dev-palette">
        ${this._devPaletteEntries().map(e=>this._renderDevPaletteRow(e))}
      </div>
    `}_renderDevPaletteRow(e){return j`
      <div class="dev-pal-row">
        <div class="dev-pal-id">
          <span class="dev-pal-badge" style="background: ${e.hex};">${e.label}</span>
          <code>${e.hex.toUpperCase()}${e.live?" ·live":""}</code>
        </div>
        ${["dark","light"].map(t=>{const i=et(e.hex,t),r=gi.DEV_GROUNDS[t];return j`
            <div class="dev-pal-scheme" style="background: ${r};">
              <span class="dev-pal-scheme-label">${t}</span>
              ${gi.DEV_SURFACES.map(t=>{const n=function(e,t,i){const r=Ye(e),n=Ye(t);if(!r||!n)return null;const a=[0,1,2].map(e=>Ge(Qe(r[e])*i+Qe(n[e])*(1-i)));return"#"+a.map(e=>Math.round(255*e).toString(16).padStart(2,"0")).join("")}(e.hex,r,t.ratio)??r,a=i?function(e,t){const i=Ye(e),r=Ye(t);if(!i||!r)return null;const n=Xe(i),a=Xe(r);return(Math.max(n,a)+.05)/(Math.min(n,a)+.05)}(i,n):null,o=null!==a&&a>=4.5;return j`
                  <div class="dev-pal-chip" style="background: ${n};">
                    <span
                      class="dev-pal-word"
                      style=${i?`color: ${i};`:V}
                      >${this._t("now")}</span
                    >
                    <span class="dev-pal-ratio ${o?"pass":"fail"}">
                      ${null===a?"—":a.toFixed(2)}
                    </span>
                    <span class="dev-pal-surface">${t.label}</span>
                  </div>
                `})}
              <code class="dev-pal-out">${(i??"—").toUpperCase()}</code>
            </div>
          `})}
      </div>
    `}_randomFrom(e){if(0===e.length)return null;return e[Math.floor(Math.random()*e.length)]}static{this.DEV_TRAFFIC_SHAPES=[{label:"Bauarbeiten",html:(e,t)=>`<p>Die Linie ${e} fährt derzeit nicht Richtung ${t}.</p><p><br></p><p>Weichen Sie ersatzweise auf die Linien E3, 46 und 49 aus.</p><p><br></p><p>Voraussichtliche Dauer: 31. August.</p><p><br></p><p>Grund: Bauarbeiten im Bereich zwischen Westbahnhof U und Hütteldorfer Straße U.</p>`},{label:"Run-on (ungetrennt)",html:e=>`<p>Linie ${e}:Betrieb nur zwischen Schottentor U und Dornbach. Weichen Sie ersatzweise auf die Linie 43A aus.Voraussichtliche Dauer: 31.07.2026.Grund: Gleisbauarbeiten im Bereich Dornbacher Straße.</p>`},{label:"Mehrere Linien",html:e=>`<p>Linie ${e}:</p><p>Kein Betrieb zwischen Lerchenfelder Straße und Franz-Josefs-Bahnhof S.</p><p>Betrieb zwischen Westbahnhof S U und Lerchenfelder Straße.</p><p>Linie 12:</p><p>Betrieb nur zwischen Hillerstraße und Franz-Josefs-Bahnhof S.</p><p>Linien 40, 41, 42:</p><p>Kein Betrieb. Die Außenäste werden von den Linien 37 und 38 übernommen.</p><p>Die Störung dauert voraussichtlich bis Ende August.</p>`},{label:"Unfall, Uhrzeit",html:e=>`<p>Linie ${e}:</p><p>Unregelmäßige Intervalle in beiden Richtungen.</p><p>Voraussichtliche Dauer: 11:30 Uhr.</p><p>Grund: Verkehrsunfall im Bereich Gersthofer Straße 140.</p>`},{label:"Unbekannter Grund",html:e=>`<p>Linie ${e}:</p><p>Es kommt zu Verzögerungen im Betrieb.</p><p>Voraussichtliche Dauer: Ende August.</p><p>Grund: Vorübergehend nicht näher bekannte Ursache.</p>`}]}static{this.styles=Ae}};e([pe({attribute:!1})],bi.prototype,"hass",void 0),e([ue()],bi.prototype,"_config",void 0),e([ue()],bi.prototype,"_activeTab",void 0),e([ue()],bi.prototype,"_versionMismatch",void 0),e([ue()],bi.prototype,"_expandedTraffic",void 0),e([ue()],bi.prototype,"_expandedElevator",void 0),e([ue()],bi.prototype,"_expandedRows",void 0),e([ue()],bi.prototype,"_expandedTransfers",void 0),e([ue()],bi.prototype,"_debugTraffic",void 0),e([ue()],bi.prototype,"_debugElevator",void 0),e([ue()],bi.prototype,"_qrOpenFor",void 0),e([ue()],bi.prototype,"_devPaletteOpen",void 0),bi=gi=e([de("wiener-linien-austria-card")],bi);export{bi as WienerLinienAustriaCard};

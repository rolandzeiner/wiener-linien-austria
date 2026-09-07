// Wiener Linien Austria — bundled by Rollup. Edit sources in src/, then `npm run build`.
function e(e,t,i,r){var n,a=arguments.length,o=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,r);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(o=(a<3?n(o):a>3?n(t,i,o):n(t,i))||o);return a>3&&o&&Object.defineProperty(t,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),n=new WeakMap;let a=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=n.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(t,e))}return e}toString(){return this.cssText}};const o=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[r+1],e[0]);return new a(i,e,r)},s=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new a("string"==typeof e?e:e+"",void 0,r))(t)})(e):e,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,f=globalThis,g=f.trustedTypes,_=g?g.emptyScript:"",m=f.reactiveElementPolyfillSupport,w=(e,t)=>e,b={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},v=(e,t)=>!l(e,t),y={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:v};Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=y){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);void 0!==r&&d(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:n}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){const a=r?.call(this);n?.call(this,t),this.requestUpdate(e,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??y}static _$Ei(){if(this.hasOwnProperty(w("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(w("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(w("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(s(e))}else void 0!==e&&t.push(s(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,r)=>{if(i)e.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of r){const r=document.createElement("style"),n=t.litNonce;void 0!==n&&r.setAttribute("nonce",n),r.textContent=i.cssText,e.appendChild(r)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(void 0!==r&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(t,i.type);this._$Em=e,null==n?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(void 0!==r&&this._$Em!==r){const e=i.getPropertyOptions(r),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:b;this._$Em=r;const a=n.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,i,r=!1,n){if(void 0!==e){const a=this.constructor;if(!1===r&&(n=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??v)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:n},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==n||void 0!==a)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,r=this[t];!0!==e||this._$AL.has(t)||void 0===r||this.C(t,void 0,i,r)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[w("elementProperties")]=new Map,x[w("finalized")]=new Map,m?.({ReactiveElement:x}),(f.reactiveElementVersions??=[]).push("2.1.2");const $=globalThis,k=e=>e,S=$.trustedTypes,A=S?S.createPolicy("lit-html",{createHTML:e=>e}):void 0,z="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,T="?"+E,C=`<${T}>`,M=document,L=()=>M.createComment(""),R=e=>null===e||"object"!=typeof e&&"function"!=typeof e,H=Array.isArray,D="[ \t\n\f\r]",O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,P=/-->/g,N=/>/g,U=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,q=/"/g,j=/^(?:script|style|textarea|title)$/i,W=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),F=Symbol.for("lit-noChange"),I=Symbol.for("lit-nothing"),V=new WeakMap,G=M.createTreeWalker(M,129);function K(e,t){if(!H(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(t):t}const Q=(e,t)=>{const i=e.length-1,r=[];let n,a=2===t?"<svg>":3===t?"<math>":"",o=O;for(let t=0;t<i;t++){const i=e[t];let s,l,d=-1,c=0;for(;c<i.length&&(o.lastIndex=c,l=o.exec(i),null!==l);)c=o.lastIndex,o===O?"!--"===l[1]?o=P:void 0!==l[1]?o=N:void 0!==l[2]?(j.test(l[2])&&(n=RegExp("</"+l[2],"g")),o=U):void 0!==l[3]&&(o=U):o===U?">"===l[0]?(o=n??O,d=-1):void 0===l[1]?d=-2:(d=o.lastIndex-l[2].length,s=l[1],o=void 0===l[3]?U:'"'===l[3]?q:B):o===q||o===B?o=U:o===P||o===N?o=O:(o=U,n=void 0);const h=o===U&&e[t+1].startsWith("/>")?" ":"";a+=o===O?i+C:d>=0?(r.push(s),i.slice(0,d)+z+i.slice(d)+E+h):i+E+(-2===d?t:h)}return[K(e,a+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),r]};class Z{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let n=0,a=0;const o=e.length-1,s=this.parts,[l,d]=Q(e,t);if(this.el=Z.createElement(l,i),G.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(r=G.nextNode())&&s.length<o;){if(1===r.nodeType){if(r.hasAttributes())for(const e of r.getAttributeNames())if(e.endsWith(z)){const t=d[a++],i=r.getAttribute(e).split(E),o=/([.?@])?(.*)/.exec(t);s.push({type:1,index:n,name:o[2],strings:i,ctor:"."===o[1]?te:"?"===o[1]?ie:"@"===o[1]?re:ee}),r.removeAttribute(e)}else e.startsWith(E)&&(s.push({type:6,index:n}),r.removeAttribute(e));if(j.test(r.tagName)){const e=r.textContent.split(E),t=e.length-1;if(t>0){r.textContent=S?S.emptyScript:"";for(let i=0;i<t;i++)r.append(e[i],L()),G.nextNode(),s.push({type:2,index:++n});r.append(e[t],L())}}}else if(8===r.nodeType)if(r.data===T)s.push({type:2,index:n});else{let e=-1;for(;-1!==(e=r.data.indexOf(E,e+1));)s.push({type:7,index:n}),e+=E.length-1}n++}}static createElement(e,t){const i=M.createElement("template");return i.innerHTML=e,i}}function Y(e,t,i=e,r){if(t===F)return t;let n=void 0!==r?i._$Co?.[r]:i._$Cl;const a=R(t)?void 0:t._$litDirective$;return n?.constructor!==a&&(n?._$AO?.(!1),void 0===a?n=void 0:(n=new a(e),n._$AT(e,i,r)),void 0!==r?(i._$Co??=[])[r]=n:i._$Cl=n),void 0!==n&&(t=Y(e,n._$AS(e,t.values),n,r)),t}class J{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??M).importNode(t,!0);G.currentNode=r;let n=G.nextNode(),a=0,o=0,s=i[0];for(;void 0!==s;){if(a===s.index){let t;2===s.type?t=new X(n,n.nextSibling,this,e):1===s.type?t=new s.ctor(n,s.name,s.strings,this,e):6===s.type&&(t=new ne(n,this,e)),this._$AV.push(t),s=i[++o]}a!==s?.index&&(n=G.nextNode(),a++)}return G.currentNode=M,r}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=I,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Y(this,e,t),R(e)?e===I||null==e||""===e?(this._$AH!==I&&this._$AR(),this._$AH=I):e!==this._$AH&&e!==F&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>H(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==I&&R(this._$AH)?this._$AA.nextSibling.data=e:this.T(M.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Z.createElement(K(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const e=new J(r,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=V.get(e.strings);return void 0===t&&V.set(e.strings,t=new Z(e)),t}k(e){H(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const n of e)r===t.length?t.push(i=new X(this.O(L()),this.O(L()),this,this.options)):i=t[r],i._$AI(n),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}let ee=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,n){this.type=1,this._$AH=I,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=I}_$AI(e,t=this,i,r){const n=this.strings;let a=!1;if(void 0===n)e=Y(this,e,t,0),a=!R(e)||e!==this._$AH&&e!==F,a&&(this._$AH=e);else{const r=e;let o,s;for(e=n[0],o=0;o<n.length-1;o++)s=Y(this,r[i+o],t,o),s===F&&(s=this._$AH[o]),a||=!R(s)||s!==this._$AH[o],s===I?e=I:e!==I&&(e+=(s??"")+n[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===I?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}};class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===I?void 0:e}}class ie extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==I)}}class re extends ee{constructor(e,t,i,r,n){super(e,t,i,r,n),this.type=5}_$AI(e,t=this){if((e=Y(this,e,t,0)??I)===F)return;const i=this._$AH,r=e===I&&i!==I||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==I&&(i===I||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Y(this,e)}}const ae=$.litHtmlPolyfillSupport;ae?.(Z,X),($.litHtmlVersions??=[]).push("3.3.2");const oe=globalThis;let se=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const r=i?.renderBefore??t;let n=r._$litPart$;if(void 0===n){const e=i?.renderBefore??null;r._$litPart$=n=new X(t.insertBefore(L(),e),e,void 0,i??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}};se._$litElement$=!0,se.finalized=!0,oe.litElementHydrateSupport?.({LitElement:se});const le=oe.litElementPolyfillSupport;le?.({LitElement:se}),(oe.litElementVersions??=[]).push("4.2.2");const de=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},ce={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:v},he=(e=ce,t,i)=>{const{kind:r,metadata:n}=i;let a=globalThis.litPropertyMetadata.get(n);if(void 0===a&&globalThis.litPropertyMetadata.set(n,a=new Map),"setter"===r&&((e=Object.create(e)).wrapped=!0),a.set(i.name,e),"accessor"===r){const{name:r}=i;return{set(i){const n=t.get.call(this);t.set.call(this,i),this.requestUpdate(r,n,e,!0,i)},init(t){return void 0!==t&&this.C(r,void 0,e,t),t}}}if("setter"===r){const{name:r}=i;return function(i){const n=this[r];t.call(this,i),this.requestUpdate(r,n,e,!0,i)}}throw Error("Unsupported decorator location: "+r)};function pe(e){return(t,i)=>"object"==typeof i?he(e,t,i):((e,t,i)=>{const r=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),r?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function ue(e){return pe({...e,state:!0,attribute:!1})}const fe=1,ge=3,_e=4,me=e=>(...t)=>({_$litDirective$:e,values:t});let we=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const be=me(class extends we{constructor(e){if(super(e),e.type!==fe||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e)));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const i=e.element.classList;for(const e of this.st)e in t||(i.remove(e),this.st.delete(e));for(const e in t){const r=!!t[e];r===this.st.has(e)||this.nt?.has(e)||(r?(i.add(e),this.st.add(e)):(i.remove(e),this.st.delete(e)))}return F}}),ve="important",ye=" !"+ve,xe=me(class extends we{constructor(e){if(super(e),e.type!==fe||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,i)=>{const r=e[i];return null==r?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?i.removeProperty(e):i[e]=null);for(const e in t){const r=t[e];if(null!=r){this.ft.add(e);const t="string"==typeof r&&r.endsWith(ye);e.includes("-")||t?i.setProperty(e,t?r.slice(0,-11):r,t?ve:""):i[e]=r}}return F}});let $e=null;class ke{}ke.render=function(e,t){$e(e,t)},self.QrCreator=ke,function(e){function t(t,i,r,n){var a={},o=e(r,i);o.u(t),o.J(),n=n||0;var s=o.h(),l=o.h()+2*n;return a.text=t,a.level=i,a.version=r,a.O=l,a.a=function(e,t){return t-=n,!(0>(e-=n)||e>=s||0>t||t>=s)&&o.a(e,t)},a}function i(e,t,i,r,n,a,o,s,l,d){function c(t,i,r,n,o,s,l){t?(e.lineTo(i+s,r+l),e.arcTo(i,r,n,o,a)):e.lineTo(i,r)}o?e.moveTo(t+a,i):e.moveTo(t,i),c(s,r,i,r,n,-a,0),c(l,r,n,t,n,0,-a),c(d,t,n,t,i,a,0),c(o,t,i,r,i,0,a)}function r(e,t,i,r,n,a,o,s,l,d){function c(t,i,r,n){e.moveTo(t+r,i),e.lineTo(t,i),e.lineTo(t,i+n),e.arcTo(t,i,t+r,i,a)}o&&c(t,i,a,a),s&&c(r,i,-a,a),l&&c(r,n,-a,-a),d&&c(t,n,a,-a)}function n(e,n){e:{var a=n.text,o=n.v,s=n.N,l=n.K,d=n.P;for(s=Math.max(1,s||1),l=Math.min(40,l||40);s<=l;s+=1)try{var c=t(a,o,s,d);break e}catch(e){}c=void 0}if(!c)return null;for(a=e.getContext("2d"),n.background&&(a.fillStyle=n.background,a.fillRect(n.left,n.top,n.size,n.size)),o=c.O,l=n.size/o,a.beginPath(),d=0;d<o;d+=1)for(s=0;s<o;s+=1){var h=a,p=n.left+s*l,u=n.top+d*l,f=d,g=s,_=c.a,m=p+l,w=u+l,b=f-1,v=f+1,y=g-1,x=g+1,$=Math.floor(Math.min(.5,Math.max(0,n.R))*l),k=_(f,g),S=_(b,y),A=_(b,g);b=_(b,x);var z=_(f,x);x=_(v,x),g=_(v,g),v=_(v,y),f=_(f,y),p=Math.round(p),u=Math.round(u),m=Math.round(m),w=Math.round(w),k?i(h,p,u,m,w,$,!A&&!f,!A&&!z,!g&&!z,!g&&!f):r(h,p,u,m,w,$,A&&f&&S,A&&z&&b,g&&z&&x,g&&f&&v)}return function(e,t){var i=t.fill;if("string"==typeof i)e.fillStyle=i;else{var r=i.type,n=i.colorStops;if(i=i.position.map(e=>Math.round(e*t.size)),"linear-gradient"===r)var a=e.createLinearGradient.apply(e,i);else{if("radial-gradient"!==r)throw Error("Unsupported fill");a=e.createRadialGradient.apply(e,i)}n.forEach(([e,t])=>{a.addColorStop(e,t)}),e.fillStyle=a}}(a,n),a.fill(),e}var a={minVersion:1,maxVersion:40,ecLevel:"L",left:0,top:0,size:200,fill:"#000",background:null,text:"no text",radius:.5,quiet:0};$e=function(e,t){var i={};Object.assign(i,a,e),i.N=i.minVersion,i.K=i.maxVersion,i.v=i.ecLevel,i.left=i.left,i.top=i.top,i.size=i.size,i.fill=i.fill,i.background=i.background,i.text=i.text,i.R=i.radius,i.P=i.quiet,t instanceof HTMLCanvasElement?(t.width===i.size&&t.height===i.size||(t.width=i.size,t.height=i.size),t.getContext("2d").clearRect(0,0,t.width,t.height),n(t,i)):((e=document.createElement("canvas")).width=i.size,e.height=i.size,i=n(e,i),t.appendChild(i))}}(function(){function e(n,o){function s(e,t){for(var i=-1;7>=i;i+=1)if(!(-1>=e+i||h<=e+i))for(var r=-1;7>=r;r+=1)-1>=t+r||h<=t+r||(c[e+i][t+r]=0<=i&&6>=i&&(0==r||6==r)||0<=r&&6>=r&&(0==i||6==i)||2<=i&&4>=i&&2<=r&&4>=r)}function l(e,i){for(var o=h=4*n+17,l=Array(o),f=0;f<o;f+=1){l[f]=Array(o);for(var g=0;g<o;g+=1)l[f][g]=null}for(c=l,s(0,0),s(h-7,0),s(0,h-7),o=r.G(n),l=0;l<o.length;l+=1)for(f=0;f<o.length;f+=1){g=o[l];var _=o[f];if(null==c[g][_])for(var m=-2;2>=m;m+=1)for(var w=-2;2>=w;w+=1)c[g+m][_+w]=-2==m||2==m||-2==w||2==w||0==m&&0==w}for(o=8;o<h-8;o+=1)null==c[o][6]&&(c[o][6]=0==o%2);for(o=8;o<h-8;o+=1)null==c[6][o]&&(c[6][o]=0==o%2);for(o=r.w(d<<3|i),l=0;15>l;l+=1)f=!e&&1==(o>>l&1),c[6>l?l:8>l?l+1:h-15+l][8]=f,c[8][8>l?h-l-1:9>l?15-l:14-l]=f;if(c[h-8][8]=!e,7<=n){for(o=r.A(n),l=0;18>l;l+=1)f=!e&&1==(o>>l&1),c[Math.floor(l/3)][l%3+h-8-3]=f;for(l=0;18>l;l+=1)f=!e&&1==(o>>l&1),c[l%3+h-8-3][Math.floor(l/3)]=f}if(null==p){for(e=a.I(n,d),o=function(){var e=[],t=0,i={B:function(){return e},c:function(t){return 1==(e[Math.floor(t/8)]>>>7-t%8&1)},put:function(e,t){for(var r=0;r<t;r+=1)i.m(1==(e>>>t-r-1&1))},f:function(){return t},m:function(i){var r=Math.floor(t/8);e.length<=r&&e.push(0),i&&(e[r]|=128>>>t%8),t+=1}};return i}(),l=0;l<u.length;l+=1)f=u[l],o.put(4,4),o.put(f.b(),r.f(4,n)),f.write(o);for(l=f=0;l<e.length;l+=1)f+=e[l].j;if(o.f()>8*f)throw Error("code length overflow. ("+o.f()+">"+8*f+")");for(o.f()+4<=8*f&&o.put(0,4);0!=o.f()%8;)o.m(!1);for(;!(o.f()>=8*f)&&(o.put(236,8),!(o.f()>=8*f));)o.put(17,8);var b=0;for(f=l=0,g=Array(e.length),_=Array(e.length),m=0;m<e.length;m+=1){var v=e[m].j,y=e[m].o-v;for(l=Math.max(l,v),f=Math.max(f,y),g[m]=Array(v),w=0;w<g[m].length;w+=1)g[m][w]=255&o.B()[w+b];for(b+=v,w=r.C(y),v=t(g[m],w.b()-1).l(w),_[m]=Array(w.b()-1),w=0;w<_[m].length;w+=1)y=w+v.b()-_[m].length,_[m][w]=0<=y?v.c(y):0}for(w=o=0;w<e.length;w+=1)o+=e[w].o;for(o=Array(o),w=b=0;w<l;w+=1)for(m=0;m<e.length;m+=1)w<g[m].length&&(o[b]=g[m][w],b+=1);for(w=0;w<f;w+=1)for(m=0;m<e.length;m+=1)w<_[m].length&&(o[b]=_[m][w],b+=1);p=o}for(e=p,o=-1,l=h-1,f=7,g=0,i=r.F(i),_=h-1;0<_;_-=2)for(6==_&&--_;;){for(m=0;2>m;m+=1)null==c[l][_-m]&&(w=!1,g<e.length&&(w=1==(e[g]>>>f&1)),i(l,_-m)&&(w=!w),c[l][_-m]=w,-1==--f&&(g+=1,f=7));if(0>(l+=o)||h<=l){l-=o,o=-o;break}}}var d=i[o],c=null,h=0,p=null,u=[],f={u:function(t){t=function(t){var i=e.s(t);return{S:function(){return 4},b:function(){return i.length},write:function(e){for(var t=0;t<i.length;t+=1)e.put(i[t],8)}}}(t),u.push(t),p=null},a:function(e,t){if(0>e||h<=e||0>t||h<=t)throw Error(e+","+t);return c[e][t]},h:function(){return h},J:function(){for(var e=0,t=0,i=0;8>i;i+=1){l(!0,i);var n=r.D(f);(0==i||e>n)&&(e=n,t=i)}l(!1,t)}};return f}function t(e,i){if(void 0===e.length)throw Error(e.length+"/"+i);var r=function(){for(var t=0;t<e.length&&0==e[t];)t+=1;for(var r=Array(e.length-t+i),n=0;n<e.length-t;n+=1)r[n]=e[n+t];return r}(),a={c:function(e){return r[e]},b:function(){return r.length},multiply:function(e){for(var i=Array(a.b()+e.b()-1),r=0;r<a.b();r+=1)for(var o=0;o<e.b();o+=1)i[r+o]^=n.i(n.g(a.c(r))+n.g(e.c(o)));return t(i,0)},l:function(e){if(0>a.b()-e.b())return a;for(var i=n.g(a.c(0))-n.g(e.c(0)),r=Array(a.b()),o=0;o<a.b();o+=1)r[o]=a.c(o);for(o=0;o<e.b();o+=1)r[o]^=n.i(n.g(e.c(o))+i);return t(r,0).l(e)}};return a}e.s=function(e){for(var t=[],i=0;i<e.length;i++){var r=e.charCodeAt(i);128>r?t.push(r):2048>r?t.push(192|r>>6,128|63&r):55296>r||57344<=r?t.push(224|r>>12,128|r>>6&63,128|63&r):(i++,r=65536+((1023&r)<<10|1023&e.charCodeAt(i)),t.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|63&r))}return t};var i={L:1,M:0,Q:3,H:2},r=function(){function e(e){for(var t=0;0!=e;)t+=1,e>>>=1;return t}var i=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],r={w:function(t){for(var i=t<<10;0<=e(i)-e(1335);)i^=1335<<e(i)-e(1335);return 21522^(t<<10|i)},A:function(t){for(var i=t<<12;0<=e(i)-e(7973);)i^=7973<<e(i)-e(7973);return t<<12|i},G:function(e){return i[e-1]},F:function(e){switch(e){case 0:return function(e,t){return 0==(e+t)%2};case 1:return function(e){return 0==e%2};case 2:return function(e,t){return 0==t%3};case 3:return function(e,t){return 0==(e+t)%3};case 4:return function(e,t){return 0==(Math.floor(e/2)+Math.floor(t/3))%2};case 5:return function(e,t){return 0==e*t%2+e*t%3};case 6:return function(e,t){return 0==(e*t%2+e*t%3)%2};case 7:return function(e,t){return 0==(e*t%3+(e+t)%2)%2};default:throw Error("bad maskPattern:"+e)}},C:function(e){for(var i=t([1],0),r=0;r<e;r+=1)i=i.multiply(t([1,n.i(r)],0));return i},f:function(e,t){if(4!=e||1>t||40<t)throw Error("mode: "+e+"; type: "+t);return 10>t?8:16},D:function(e){for(var t=e.h(),i=0,r=0;r<t;r+=1)for(var n=0;n<t;n+=1){for(var a=0,o=e.a(r,n),s=-1;1>=s;s+=1)if(!(0>r+s||t<=r+s))for(var l=-1;1>=l;l+=1)0>n+l||t<=n+l||(0!=s||0!=l)&&o==e.a(r+s,n+l)&&(a+=1);5<a&&(i+=3+a-5)}for(r=0;r<t-1;r+=1)for(n=0;n<t-1;n+=1)a=0,e.a(r,n)&&(a+=1),e.a(r+1,n)&&(a+=1),e.a(r,n+1)&&(a+=1),e.a(r+1,n+1)&&(a+=1),(0==a||4==a)&&(i+=3);for(r=0;r<t;r+=1)for(n=0;n<t-6;n+=1)e.a(r,n)&&!e.a(r,n+1)&&e.a(r,n+2)&&e.a(r,n+3)&&e.a(r,n+4)&&!e.a(r,n+5)&&e.a(r,n+6)&&(i+=40);for(n=0;n<t;n+=1)for(r=0;r<t-6;r+=1)e.a(r,n)&&!e.a(r+1,n)&&e.a(r+2,n)&&e.a(r+3,n)&&e.a(r+4,n)&&!e.a(r+5,n)&&e.a(r+6,n)&&(i+=40);for(n=a=0;n<t;n+=1)for(r=0;r<t;r+=1)e.a(r,n)&&(a+=1);return i+Math.abs(100*a/t/t-50)/5*10}};return r}(),n=function(){for(var e=Array(256),t=Array(256),i=0;8>i;i+=1)e[i]=1<<i;for(i=8;256>i;i+=1)e[i]=e[i-4]^e[i-5]^e[i-6]^e[i-8];for(i=0;255>i;i+=1)t[e[i]]=i;return{g:function(e){if(1>e)throw Error("glog("+e+")");return t[e]},i:function(t){for(;0>t;)t+=255;for(;256<=t;)t-=255;return e[t]}}}(),a=function(){function e(e,r){switch(r){case i.L:return t[4*(e-1)];case i.M:return t[4*(e-1)+1];case i.Q:return t[4*(e-1)+2];case i.H:return t[4*(e-1)+3]}}var t=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],r={I:function(t,i){var r=e(t,i);if(void 0===r)throw Error("bad rs block @ typeNumber:"+t+"/errorCorrectLevel:"+i);t=r.length/3,i=[];for(var n=0;n<t;n+=1)for(var a=r[3*n],o=r[3*n+1],s=r[3*n+2],l=0;l<a;l+=1){var d=s,c={};c.o=o,c.j=d,i.push(c)}return i}};return r}();return e}());var Se=QrCreator;const Ae=o`
  :host {
    /* color-scheme enables light-dark() and steers forced-colors
       palette selection (WCAG 1.4.11). HA's active theme drives the
       resolution; the card just opts in. */
    color-scheme: light dark;
    display: block;
    container-type: inline-size;
    container-name: wlcard;

    /* Brand accent inherits HA's primary. Per-station accent override
       lands inline on .station via style="--wl-accent: …;". */
    --wl-accent: var(--primary-color);

    /* The .line-badge box, as one authoritative pair. The badge derives
       its min-width from these rather than declaring its own, so the
       token can never disagree with the element it describes — the
       departure trail aligns its stroke to the badge's right border and
       any drift between the two shows up as a misaligned connector.
       No line label is wide enough to beat the 2.4em min-width, so
       every badge is exactly --wl-badge-width across. */
    --wl-badge-pad-x: 8px;
    --wl-badge-width: calc(0.85rem * 2.4 + var(--wl-badge-pad-x) * 2);

    /* Trail geometry. All of it lives on :host rather than on .dep-list,
       because BOTH trails read it: the departure list and the hero. That
       is not cosmetic tidying — a token declared on .dep-list is simply
       absent inside .hero, so any calc() referencing it there is invalid
       at computed-value time and the whole declaration is dropped. That
       silently cost the hero its connector once already: the trail fell
       back to flush-left while the corner-squaring rule, which contains
       no var(), still applied to the opposite corner.

       --stops-ahead-name-gap is the dot-to-station-name gap; the
       departure row reads it to line its direction text up with the stop
       names below. --wl-row-pad-left is where a badge's left border
       falls, derived rather than picked: the trail can't sit further
       left than half a dot without .stops-ahead needing negative
       padding, which would slide the dots off the line, so the badge
       moves to the trail instead of the reverse. */
    --stops-ahead-dot-size: 10px;
    --stops-ahead-line-width: 2px;
    --stops-ahead-name-gap: var(--ha-space-2, 8px);
    --wl-row-pad-left: calc(
      var(--stops-ahead-dot-size) / 2 - var(--stops-ahead-line-width) / 2
    );

    /* Text-safe companion to --wl-accent. GTFS route_color is a
       *background* colour — Wiener Linien ships 0A295D for city buses
       and 000000 for the Badner Bahn, both fine behind white badge text
       and both around 1.19:1 when painted *as* text on a dark card.
       Anything colouring glyphs reads from this token; backgrounds keep
       using --wl-accent directly.

       The lightness-clamped value lands inline on .station alongside
       --wl-accent, computed in accentTextColor() (utils/color.ts) —
       not in CSS, because the relative-colour declaration that did the
       clamp until v1.7.3 mis-resolved on older embedded WebViews and
       @supports cannot probe it (issue #95). This declaration is the
       fallback for the cases the helper declines: no theme polarity
       yet, or an accent it can't resolve (the neutral
       var(--primary-color)). Legible but hueless, never invisible. */
    --wl-accent-text: var(--primary-text-color);

    /* Semantic state tokens layered over HA's official semantic palette
       so theme authors can recolour the whole portfolio in one place;
       hard-coded fallbacks for older HA versions. */
    --wl-rt:      var(--success-color, #43a047);
    --wl-warning: var(--warning-color, #ffa000);
    --wl-error:   var(--error-color,   #db4437);
    --wl-info:    var(--info-color,    #1565c0);
    /* ISA / ISO 7001 accessibility blue (Pantone 285 C). Kept on its
       own token — separate from --wl-info — so the wheelchair pill
       always renders in the standards-correct colour, while themes can
       still override if they need to. */
    --wl-a11y:    #0072CE;
    /* Air conditioning. Deliberately NOT --wl-info: comfort is not a
       standards-defined accessibility guarantee.
       4.84:1 behind the white glyph, past the 4.5:1 AA text bar and well
       past the 3:1 of SC 1.4.11 that governs an icon. Brighter cyans
       look fresher and fail it — #00B8CC is 2.41:1 — so raising the
       lightness here means giving up the white glyph.
       It shares its hue with --wl-a11y (both 207deg), differing only in
       saturation and lightness, so the two badges deliberately read as a
       matched pair rather than as contrasting colours. WCAG 1.4.1 is
       satisfied by the glyph shapes, not by the fills. */
    --wl-cooling: #3276AE;

    /* Spacing / radius / sizing — layered over the HA Design System
       so the card moves with HA when tokens evolve. Values match
       linz-linien-austria so a stacked dashboard reads as one
       family. */
    --wl-radius-sm: var(--ha-border-radius-sm, 4px);
    --wl-radius-md: var(--ha-border-radius-md, 8px);
    --wl-radius-lg: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
    /* These names were wrong until v1.7.6 and nothing complained: var()
       on a token HA does not define is not an error, it just resolves to
       the fallback. So the card ran entirely on its own literals while
       looking theme-aware — which is how --ha-spacing-3 came to mean
       14px on one line and 12px on the next.

       Verified against the frontend's src/resources/theme/core.globals.ts:
         --ha-space-N          4px grid, 1…20   (was --ha-spacing-N)
         --ha-font-size-*      xs 10 / s 12 / m 14 / l 16 / xl 20px.
                               typography.globals.ts sets the root to
                               font-size:14px, so -m is 1rem, NOT 0.875 —
                               do the rem maths at 14px or just write px.
         --ha-border-radius-*  sm 4 / md 8 / lg 12 / xl 16 / pill / circle
                                                (was --ha-radius-*)
         --ha-animation-duration-*  none 1 / instant 75 / fast 150 /
                                    normal 250 / slow 350ms
                                                (was --ha-transition-duration-*)
       There is no easing token — --ha-transition-easing-standard never
       existed either, so easings are now named directly.

       Fallbacks are kept and now match the token they stand in for.
       Adopting a new --ha-* token means checking core.globals.ts first;
       a typo here is invisible. */
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

  /* Tabs sit flush with the card edge — direct child of <ha-card>, not
     inside .wrap. Three active cues (colour + weight + inset underline)
     so the active tab reads without colour vision. */
  /* The strip is split in two: .tabs scrolls horizontally on its own,
     .tab-actions stays pinned outside that scroller so the buttons
     don't drift off-screen with a long tab list. */
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
  /* Two 32px buttons + the 2px gap. Held even when the active stop has
     no coordinates and the QR button drops out, so switching tabs never
     re-flows the tab widths. */
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

  /* Per-station section. Inline --wl-accent on this element drives the
     icon-tile tint, line-badge fallback, alert tints, and CTA fill —
     and the atmospheric radial wash below. */
  .station {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--wl-row-gap);
    /* Soft radial wash from the top-left in the station's line accent.
       Picks up the per-station --wl-accent automatically, adds depth
       without competing with user themes. Tuned conservatively (6%
       opacity, 70% radius) so it reads as a tint rather than a tile —
       theme-agnostic atmosphere, frontend-design audit. */
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

  /* Header: square accent tile (left), title block (centre), circular
     icon-action (right). Mirrors HA's hui-tile-card composition. */
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
    /* The QR toggle is a <button>, the maps link an <a>: without this
       reset the button keeps its UA padding and the two boxes disagree,
       so the round hover surface stops being a circle centred on the
       glyph. */
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
  /* Same inline-baseline correction as .hero-a11y: ha-icon is
     inline-level, so the ha-svg-icon inside it sits on a text baseline
     and reserves descender space below the glyph. Inside a round
     button that lifts the icon above true centre and the hover circle
     reads as misaligned. Sizing ha-icon as a flex box of exactly the
     glyph's size removes the line box, and with it the offset. */
  .icon-action ha-icon {
    --mdc-icon-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--mdc-icon-size);
    height: var(--mdc-icon-size);
  }

  /* Hero block — Linz-Linien-aligned layout: tinted background, big
     countdown on the left, line-badge + direction column on the right.
     Matches linz-linien-austria so a stacked dashboard reads as one
     visual family. The per-station --wl-accent (set inline on .station)
     drives the tint and the big-number colour; the row beside lists
     the next departure's line, direction, platform, and a realtime
     pill if applicable. */
  .hero {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: var(--ha-space-3, 12px);
    /* Named so the hero connector stub can bridge it, and so the item
       margins below can reuse the one value. */
    --wl-hero-row-gap: 6px;
    /* Spacing lives on the items, NOT on the track gap. An expandable
       entry always emits a .hero-detail panel; collapsed, that panel is
       a zero-height grid row, so a row-gap would apply above AND below
       it and leave two gaps between the entries it separates, while an
       entry without stops_ahead emits no panel and got one. Two heroes
       on the same dashboard then measured differently.

       A negative margin on the panel does NOT fix this: a margin changes
       an item's contribution to its own track, never the fixed space
       the grid inserts between tracks. Only removing the gap does. This
       is the same reason .dep-list spaces its rows with padding and
       borders rather than a gap. */
    row-gap: 0;
    align-items: center;
    /* Cosmetics (background, padding, radius) live on .hero-host so
       the tinted surface visually contains both the grid and any
       expanded stops_ahead panel below. The .hero grid itself just
       does layout — entries + their panels live in column 2 in
       interleaved row order so each panel sits directly below its
       trigger entry; .hero-time pins to row 1 of column 1 and stays
       vertically centred against the first entry regardless of
       which panels expand below. */
  }
  .hero > .hero-time {
    grid-column: 1;
    grid-row: 1;
    /* The metric (2.5rem on wide cards) is taller than an entry, so it
       sized grid row 1 and left the first entry reading ~7px further
       from the second than every other pair in the trail. Symmetric
       negative margins cancel its own height, so it contributes nothing
       to the row while the glyphs stay put: they overflow equally up
       into hero-host's padding and down into column 1, which is empty
       on every row below. Nothing clips them — ha-card is the only
       overflow: hidden ancestor and it wraps the whole card.

       Not height: 0 — this is a baseline flex line, and collapsing the
       box makes its content hang below the box rather than stay centred
       on it — which dropped the countdown well under the badge on a
       one-entry hero, where there was no second row to disguise it.
       Margins shrink the box's footprint without moving its content.
       Halving --wl-metric-size slightly over-shrinks (the line box can
       exceed the font size), and over-shrinking is the safe direction:
       the row falls back to entry height and the box stays centred. */
    align-self: center;
    margin-block: calc(var(--wl-metric-size) / -2);
    /* Optical correction. Centring the BOX is not centring the INK:
       wl-sans-bold (TeX Gyre Heros, 1000 upm) declares hhea ascent 1125
       / descent -307 and leaves USE_TYPO_METRICS off, so browsers use
       those. Under line-height: 1 that puts the baseline 0.909em below
       the line-box top, and the ink of "Jetzt" (yMax 729, yMin -12)
       centres 0.0505em BELOW the box centre — about 2px low at 2.5rem,
       which is what a one-entry hero shows plainly. Digits measure
       0.047em to 0.0545em, so one constant covers every value the
       metric renders. A transform rather than a margin: it must not
       feed back into row sizing. */
    translate: 0 calc(var(--wl-metric-size) * -0.05);
  }
  .hero > .hero-entry {
    grid-column: 2;
  }
  /* Every entry but the first carries the gap above it. A closed panel
     between two entries adds nothing, so the spacing is identical
     whether or not the stop has trail data. */
  .hero > .hero-entry ~ .hero-entry {
    margin-top: var(--wl-hero-row-gap);
  }
  /* Detail panel spans both columns so its dot column starts at the
     hero-host's left padding — long station names get the full inner
     width to render before they need to truncate. */
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
  /* hero-host carries the cosmetics (background, padding, radius)
     so the tinted surface wraps both the .hero grid and any
     expanded stops_ahead panels in one continuous block. */
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
    /* Containing block for the connector stub (wide cards only). */
    position: relative;
  }
  /* The dep-row version leans on .type-icon's own margin-right for its
     spacing; .hero-entry is a flex row with its own gap, so the margin
     would double up. */
  .hero-entry .type-icon {
    margin-right: 0;
  }
  .hero-chevron {
    --mdc-icon-size: 18px;
    color: var(--secondary-text-color);
    margin-left: auto;
    flex-shrink: 0;
    /* will-change promotes the chevron to its own composite layer so
       the rotation animates on the GPU instead of triggering a layout
       pass that nudges flex siblings during the transition. */
    will-change: transform;
    transition: transform
      var(--ha-animation-duration-fast, 150ms)
 ease;
  }
  .hero-entry.expanded .hero-chevron {
    transform: rotate(180deg);
  }
  /* Hero-side collapsible panel — same 0fr↔1fr trick as
     .dep-row-detail so the trail animates to intrinsic height. The
     entry itself reuses the same .stops-ahead inner styling. */
  .hero-detail {
    display: grid;
    grid-template-rows: 0fr;
    transition:
      grid-template-rows 0.24s ease,
      margin-top 0.24s ease;
    /* Closed, this panel is a zero-height row that must cost nothing —
       .hero carries no row-gap (see there), so it doesn't. Open, it
       buys its own gap below the entry it belongs to; the entry after
       it already carries one. Transitioned with grid-template-rows so
       the gap grows with the panel instead of snapping at frame one,
       and so the connector stub (which reaches exactly one gap past the
       entry's bottom edge) always meets the trail's top. */
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
    /* Single-line ellipsis. Long Wiener Linien direction names like
       "Floridsdorf, U-Bahn-Station" otherwise wrap onto a 2nd or 3rd
       line and inflate the hero's vertical footprint. min-width: 0 is
       required for text-overflow: ellipsis to work inside flex. */
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
  /* Hero status flags — icon-only badges on the next departure, each
     rendered only when its condition holds AND the user enabled it
     (show_accessibility / show_cooling).
     Sized rather than padded: 2px/6px padding around a 16px glyph
     resolves to 20x28, so the previous border-radius:999px produced a
     lozenge, not the circle it reads as at a glance. A fixed 24px box
     keeps both badges identical whatever glyph sits inside. */
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
  /* Comfort flag, rendered only with show_cooling on. Same circle and
     the same white glyph as .hero-a11y so a row carrying both reads as
     one set; only the fill differs. */
  .hero-cooling {
    background: var(--wl-cooling);
  }
  /* ha-icon is inline-level by default, so the ha-svg-icon inside it sits
     on a text baseline and reserves descender space underneath. Inside a
     24px circle that lifts the glyph a couple of pixels above true centre
     — visible on a shape this small. Making ha-icon a flex box of exactly
     the glyph's size removes the line box, and with it the offset. */
  .hero-a11y ha-icon,
  .hero-cooling ha-icon {
    --mdc-icon-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
  }

  /* Version banner — accent surface that uses warning tokens. The
     button is rendered bare by renderVersionBanner (shared-render.ts);
     the .banner > button selector below tints it to match. */
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

  /* Lift location rendered as the path it is — "U3 Mittelbahnsteig ›
     Ausgang Schlachthausgasse › Ausgang Hainburger Weg". The separator is
     decorative and aria-hidden; the row's aria-label still carries the
     original unsegmented string, so the accessible name is unchanged. */
  .lift-path {
    display: inline;
  }
  .lift-path-sep {
    margin: 0 5px;
    color: var(--secondary-text-color);
    font-weight: 400;
  }
  /* Reason line with its category pictogram. flex-start keeps the icon on
     the first line when the reason wraps to several. */
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
  /* Disruption body. utils/traffic-notice.ts recovers the structure the
     operator writes in prose but never marks up — per-line headings,
     statements, and the trailing labelled facts — so the layout can do
     what the <p> soup can't: let someone scan for their own line, or for
     the reason, without reading the whole notice. */
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

  /* "Linie 43:" / "Linien 40, 41, 42:" — the section header of a per-line
     block. Signage-style: accent rule, uppercase, tracked out. A notice
     covering seven tram lines is unreadable without these.

     Only rendered when a notice has two or more — a lone heading segments
     nothing and merely restates the line already in the alert title, so
     _renderTrafficNotice drops it. */
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
  /* No leading gap when the notice opens with a heading. */
  .alert-desc-heading:first-child {
    margin-top: 0;
  }

  /* Labelled facts (Grund / Voraussichtliche Dauer). Pulled out of the
     prose flow and set as label→value pairs above the timing meta row, so
     the two most-asked questions — why, and until when — are findable at
     a glance instead of buried in the last sentence. */
  .alert-facts {
    display: grid;
    gap: 4px 10px;
    margin: 10px 0 0;
    padding-top: 8px;
    border-top: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
  }
  /* Label column sizes to its own text — no minimum. A floor here padded
     the short label ("Grund") out to a width set by nothing in particular,
     which reads as a stray gap rather than as alignment. Rows size
     independently on purpose: with two facts of very different label
     lengths, a shared column would push every value out to the width of
     "Voraussichtliche Dauer". */
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
  /* Pictogram for the reason category (excavator, ambulance, …) and the
     date/time distinction. Decorative — the label text beside it already
     names the field, so it carries aria-hidden and adds nothing for a
     screen reader. Sized off the label rather than the body text so it
     stays subordinate to the value. */
  .alert-fact dt ha-icon {
    --mdc-icon-size: 14px;
    flex-shrink: 0;
    color: var(--wl-accent-text);
  }
  .alert-fact dd {
    margin: 0;
    color: var(--primary-text-color);
  }
  /* Narrow cards can't hold a label column beside "Voraussichtliche
     Dauer" — stack instead of letting the value squeeze to two words a
     line. Matches the 360px breakpoint the rest of the card uses. */
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

  /* Departure rows: rack-style repeated unit. Soft accent surface so the
     section reads as a single coherent block rather than a row of
     dividers. */
  /* Snap the badge box to whole pixels. Unrounded it is 48.64px
     (0.85rem × 2.4 + 16px at a 16px root), which leaves both the badge's
     right border and the trail aligned to it on a fractional x. The
     row's connector stub and the panel's segments resolve to the same
     coordinate but sit in different containing blocks, so the browser
     rounds their edges independently and the stub paints a device pixel
     wider than the line it continues.

     Rounding the token alone is not enough — that moves the trail off a
     badge which is still 48.64px, which is the misalignment this
     replaced. Because .line-badge derives its min-width from the same
     token, snapping here moves the badge and the trail together: badge
     48px, right border and stroke both landing on 52px.

     Guarded because a failing round() would make the token invalid at
     computed-value time, cascading into both the badge's min-width and
     --wl-trail-x. */
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
    /* x of the trail's stroke centre, measured from a row's left edge.
       The open row's connector stub, the trail's line and its dots all
       derive from this one value, which is what guarantees they meet.

       The stroke sits flush inside one of the badge's vertical borders,
       so it reads as that border carrying on downwards: the left one on
       narrow cards, where the trail stays at the card's edge and long
       station names keep their full width, and the right one once the
       container-query override further down has room to indent it.
       Either way the stroke is inside the badge's footprint, which is
       what lets the stub emerge from under the badge.

       --wl-badge-width (on :host) is exact rather than approximate:
       nothing resets box-sizing in this shadow root, so .line-badge is
       content-box, and it derives its min-width from that same token.
       Kept in rem, not em, so nothing re-resolves against a
       descendant's own font-size. */
    /* The .dep-row grid's column gap, named so the direction cell can
       subtract it when aligning itself to the stop names. */
    --wl-dep-col-gap: var(--ha-space-2, 8px);
    --wl-trail-x: calc(var(--stops-ahead-dot-size) / 2);
  }
  .dep-row {
    display: grid;
    grid-template-columns: max-content 1fr auto auto auto;
    align-items: center;
    gap: var(--wl-dep-col-gap);
    /* Symmetric: the old right-hand 2px matched nothing and left every
       row sitting 2px left of centre in its container. */
    padding: var(--ha-space-2, 8px) var(--wl-row-pad-left);
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    transition: background-color
      var(--ha-animation-duration-fast, 150ms)
 ease;
  }
  .dep-row:last-child {
    border-bottom: none;
  }
  /* Soft tint on hover so brushing the cursor across the list reads
     as interactive without flashing. Mirrors the Linz card. The
     prefers-reduced-motion block at the bottom of this stylesheet
     neutralises the transition for users who opt out. */
  .dep-row:hover {
    background: color-mix(
      in srgb,
      var(--primary-text-color) 4%,
      transparent
    );
  }
  /* When the row carries a stops_ahead panel, the entire row becomes a
     button-like surface. Cursor and user-select cues mirror the alert
     pattern (.alert) so the affordance is consistent across the card. */
  .dep-row.expandable {
    cursor: pointer;
    user-select: none;
    /* Containing block for the open row's connector stub below. */
    position: relative;
    /* Divider moves to the trailing .dep-row-detail (which an expandable
       row always emits, expanded or not) so the rule falls BELOW the
       stops-ahead trail: the trail reads as part of this departure and
       the line separates it from the next one. */
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
  /* Connector stub: bridges the gap between the line-badge and the trail
     in the panel below, so the trail reads as growing out of the badge
     rather than floating under it. It spans from the row's vertical
     centre to the row's bottom edge, and .line-badge (z-index 1) paints
     over the upper half — that way the stub appears to start exactly at
     the badge's bottom edge without hard-coding the badge's height. The
     panel's own line starts at its top edge, which is flush against the
     row's bottom, so the two form one continuous stroke. */
  .dep-row.expanded::after {
    content: "";
    position: absolute;
    left: calc(var(--wl-trail-x) - var(--stops-ahead-line-width) / 2);
    top: 50%;
    bottom: 0;
    width: var(--stops-ahead-line-width);
    background: var(--stops-ahead-line, var(--primary-color));
  }
  /* Square off the badge corner the trail leaves from, so the stroke
     reads as continuing out of the badge rather than sliding past a
     rounded edge. Which corner that is follows --wl-trail-x: a
     flush-left trail leaves from the badge's leading edge, an indented
     one from its trailing edge (flipped in the wide-card override). */
  .dep-row.expanded .line-badge {
    border-bottom-left-radius: 0;
  }
  /* Detail panel: sibling <li> rendered immediately below an expandable
     .dep-row. The 0fr ↔ 1fr trick mirrors .alert-detail and animates to
     intrinsic height so the stop list never clips. The panel is always
     in the DOM (inside aria-hidden) so screen readers can step into it
     when expanded; collapse just zeroes the row track. */
  .dep-row-detail {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.24s ease;
    list-style: none;
    /* Carries the divider on behalf of its .dep-row (see above). Applied
       in both states rather than only on .expanded: collapsed the panel
       is zero-height, so the rule lands exactly where the row's own
       border used to sit, and it then travels smoothly with the panel
       instead of snapping between two positions mid-animation. */
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
  /* Metro-map style trail: a vertical line in the line's brand colour
     with one filled dot per stop. Indent matches the row's line-badge
     (min-width 2.4em) + gap (8px) so the line visually descends from
     under the badge. The connecting line is drawn as a 3px-wide pseudo-
     element under the dot column; dots overlap it so they appear "on"
     the line. The terminus stop highlights with a hollow ring + bold
     name to anchor the destination. */
  .stops-ahead {
    --stops-ahead-line: var(--primary-color);
    /* Doubles as the gap between stops and the panel's top padding, so
       a stop's connector segment can bridge either with one offset. */
    --stops-ahead-gap: var(--ha-space-2, 8px);
    list-style: none;
    margin: 0;
    /* Symmetric top and bottom. The old 10px bottom existed to feed the
       removed single stroke's end calculation (bottom: 10px + half a
       dot); with the line drawn per stop it described nothing. */
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
  /* The vertical line, drawn per stop rather than as one stroke down the
     whole list. Each stop carries an upper segment (from the gap above
     down to its own dot) and a lower one (from its dot to its bottom
     edge); the first stop has no upper segment and the last no lower
     one, so the line begins and ends exactly on a dot.

     A single stroke pinned to the list's top and bottom was simpler but
     assumed every stop is one row tall. Expanding the terminus's
     transfer chips makes that entry taller while its dot stays centred
     in it, so the stroke overshot the ring. Segments are measured
     against each stop's own box, so any stop can grow without the ends
     drifting. They sit behind the dots, which carry z-index 1. */
  .stops-ahead-stop:not(:first-child)::before,
  .dep-row-detail .stops-ahead-stop::before,
  .stops-ahead-stop:not(:last-child)::after {
    content: "";
    position: absolute;
    left: calc(var(--stops-ahead-dot-size) / 2 - var(--stops-ahead-line-width) / 2);
    width: var(--stops-ahead-line-width);
    background: var(--stops-ahead-line);
    /* Square ends, deliberately. The single stroke this replaced carried
       border-radius: 2px, which only ever rounded the two far ends of a
       list-long bar. On segments a fraction of that length, a 2px radius
       on a 2px-wide bar curves away enough of both ends to read as a
       thinner line than the row's connector stub, and to pinch every
       join into an apparent gap. Butt joins are what make the segments
       read as one stroke. */
  }
  /* Upper segment. In a departure panel the first stop gets one too, so
     the line reaches the panel's top edge and meets the row's connector
     stub — the panel's top padding equals the inter-stop gap, so the
     same offset covers both cases. The hero panel has no stub, so its
     first stop keeps the line starting at the dot. */
  .stops-ahead-stop:not(:first-child)::before,
  .dep-row-detail .stops-ahead-stop::before {
    top: calc(-1 * var(--stops-ahead-gap));
    height: calc(50% + var(--stops-ahead-gap));
  }
  /* Lower segment: runs to the stop's bottom edge, where the next stop's
     upper segment picks it up across the gap. */
  .stops-ahead-stop:not(:last-child)::after {
    top: 50%;
    bottom: 0;
  }
  /* Departure-row trail: driven by --wl-trail-x so it always shares an
     axis with its row's connector stub. Indenting the list is enough —
     the dots and their segments are positioned inside each stop, so they
     follow. Two classes of specificity, so this wins over the wide-card
     override further down without being repeated inside that container
     query. The hero's copy of .stops-ahead is unaffected — it has no
     badge to grow from. */
  .dep-row-detail .stops-ahead {
    padding-left: calc(var(--wl-trail-x) - var(--stops-ahead-dot-size) / 2);
  }
  .stops-ahead-stop {
    position: relative;
    display: flex;
    flex-direction: column;
    /* Owns the space under the name row on its own — .stops-ahead-others
       used to add a further 2px margin-top, so the real gap was 6px and
       you had to find both declarations to know it. */
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
  /* Pointer cursor on intermediate stops the user can actually click —
     the row gets role=button only when the stop has transfer-to-
     other-lines (otherLines length above zero) and is therefore an
     expand/collapse affordance for the +N transfer panel. Stops with
     U-Bahn-only inline chips (no toggle) stay text-cursor since
     there is nothing to click. */
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
    /* Hollow ring at the terminus, anchoring "this is where you end up". */
    background: var(--card-background-color, var(--ha-card-background, #fff));
    box-shadow: inset 0 0 0 var(--stops-ahead-line-width) var(--stops-ahead-line);
  }
  /* Transfer-line chips: small pill badges. U-Bahn chips sit inline
     immediately after the station name (always visible, brand-coloured).
     Tram/bus/night transfers sit behind the right-aligned toggle button
     ("+N" with a chevron) and wrap to a second row inside the same
     stop entry when expanded. */
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
  /* "+N ▾" toggle button: pill-shaped, neutral background, chevron
     rotates when the non-metro chip group below is expanded. Pinned
     to the right via margin-left:auto. */
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
  /* Second-row container for non-metro chips. Wraps freely; sits below
     the station-name row so its width never pushes the layout. */
  .stops-ahead-others {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ha-space-1, 4px);
  }
  /* Non-metro chips render slightly lighter so the inline U-Bahn chips
     stay the dominant signal. */
  .stops-ahead-line-chip--other {
    opacity: 0.92;
  }
  .line-badge {
    /* Paints over the upper half of an open row's connector stub, so the
       stub emerges from the badge's bottom edge. */
    position: relative;
    z-index: 1;
    /* Declared here rather than on the .expanded rule so the corner
       eases back on collapse too. The reduced-motion block at the foot
       of this stylesheet neutralises it for users who opt out. */
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
  /* Towards cell: type-icon sits as a sibling of .towards-rows so when
     the delay wraps under the direction name, both rows share the same
     left edge — aligned with the direction's text, not the icon. */
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
  /* Trailing column container — holds the optional platform pill and
     the optional flags icons in one grid cell. Inline-flex so platform
     sits left of flags (and thus left of the wheelchair icon, per the
     portfolio convention). */
  .row-end {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  /* Platform pill — small, muted, monospace digits so "Steig 7" /
     "Gleis 12" line up visually across rows. Same shape as Linz's
     .row-platform with the wiener-namespace tokens. */
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
  /* State colours — Linz parity. now / late / early class lights up
     the countdown so the user catches the schedule deviation at a
     glance without parsing the delay text. The Wiener Linien API does
     not expose a realtime-vs-scheduled distinction, so the live-pulse
     dot Linz uses isn't applicable here — countdowns are coloured
     purely by their delay state. */
  /* .now is per-ROW, not per-station: the row re-declares
     --wl-accent-text from its own line (see _rowAccentText), because the
     value inherited from .station is the hero lead's colour — two lines
     both at Jetzt otherwise paint the same hue. Only this list surface
     resolves per row; the hero and header keep the station accent. */
  .countdown.now   { color: var(--wl-accent-text); }
  .countdown.late  { color: var(--wl-error); }
  .countdown.early { color: var(--wl-rt); }

  /* Empty / fallback states */
  .empty {
    padding: 18px 0;
    color: var(--secondary-text-color);
    text-align: center;
    font-size: 0.85rem;
  }

  /* Stale-feed empty state: a headline in the same voice as the other
     empty states, then the explanation. Horizontal padding (absent on the
     plain .empty, which is a single short line) keeps the detail sentence
     off the card edge on narrow dashboards. */
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
    /* 34em keeps the sentence near the 45-75 character measure that
       reads comfortably, without forcing a width on narrow cards. */
    max-width: 34em;
    margin: 0 auto;
    line-height: 1.4;
  }
  .empty .empty-meta {
    font-size: 0.78rem;
    opacity: 0.75;
  }

  /* Partial staleness: some lines at this stop still report, so the board
     renders normally and this note explains the gap rather than replacing
     the list. Deliberately quiet — the departures are the content. */
  .stale-note {
    padding: 4px 0 8px;
    color: var(--secondary-text-color);
    font-size: 0.78rem;
  }

  /* Footer: attribution timestamp / etc. Right-pin via margin-left:auto.
     Lives inside .wrap (which already pads horizontally), so padding
     stays vertical-only. */
  .foot {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    /* Eat .wrap's flex gap above and bottom padding below, so .foot
       butts up against the last row's bottom edge AND bottoms-out at
       the card edge — matching linz-linien (where .foot is a direct
       ha-card child with no gap above and no padding below). Without
       margin-top, .wrap's --wl-row-gap pushes the divider 12px below
       the last row; without margin-bottom, the timestamp sits 8px +
       --wl-pad-y above the card edge instead of being vertically
       centred between divider and edge. */
    margin-top: calc(-1 * var(--wl-row-gap));
    margin-bottom: calc(-1 * var(--wl-pad-y));
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    font-size: 0.7rem;
    color: var(--secondary-text-color);
  }
  .timestamp {
    margin-left: auto;
  }

  /* Dev-mode strip — visible only with ?wl_debug=1 or localStorage.wl_debug=1 */
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

  /* Dev-mode palette panel. Every row shows one accent resolved for both
     schemes at once, on both accented surfaces the countdown lands on —
     so it deliberately does NOT follow the active theme: the two scheme
     blocks carry HA's stock card backgrounds inline. */
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
  /* Deliberately a plain horizontal label: writing-mode + rotate would
     save a few px but this panel exists to be read on the old WebViews
     that motivated the fix in the first place. */
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

  /* QR icon button — gentle accent tint while the panel is expanded
     so the toggle state reads at a glance, mirroring how dep-row's
     row-chevron flips on expand. */
  .qr-toggle.expanded {
    background: color-mix(in srgb, var(--primary-color) 14%, transparent);
    color: var(--primary-text-color);
  }
  /* Inline QR panel — same 0fr↔1fr grid-template-rows trick as
     .dep-row-detail and .stops-ahead-detail so the panel animates to
     its intrinsic height and never clips the canvas mid-transition.
     Sits between the header and the hero so the QR feels like an
     extension of the stop card rather than a modal interruption. */
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
  /* Canvas wrapper — qr-creator appends a 220×220 canvas; the white
     plate gives the QR a quiet zone independent of theme background
     so contrast stays clean in dark mode too. */
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

  /* Container density ladder. One token tweak per breakpoint cascades
     through every component above. */
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

  /* Narrow cards (sidebar dashboards, mobile portrait) — the hero
     stacks "Jetzt"/countdown above the line + towards row so the
     direction name gets the full container width instead of being
     truncated next to a wide "Jetzt". */
  @container wlcard (inline-size < 420px) {
    .hero {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      /* No gap here either — flex spaces a zero-height closed panel
         exactly the way grid does. The item margins carry it. */
    }
    /* The negative margins above are a grid-row-sizing fix. Here the
       hero is a flex column, the countdown is its own stacked line, and
       it must take its natural footprint and full width back — left as
       is, the margins would pull the entry below up into it. Selector is
       kept at .hero > .hero-time: a container query adds no specificity,
       so a bare .hero-time would lose to the base rule. */
    .hero > .hero-time {
      align-self: stretch;
      /* Stacked above the first entry, so it buys the gap the entry's
         own ~ rule doesn't give it (that rule skips the first entry). */
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
    /* Wide enough to afford the metro-map indent. The stroke's right
       edge sits flush with the badge's right border (hence the half
       line-width back-off), so with that corner squared off the line
       reads as the border itself continuing downwards rather than as a
       separate stroke starting near it. Narrow cards keep the
       flush-left layout for readability of long station names. Moving
       the token moves the stub, the line and the dots together. */
    .dep-list {
      --wl-trail-x: calc(
        var(--wl-row-pad-left) + var(--wl-badge-width) -
          var(--stops-ahead-line-width) / 2
      );
    }
    /* Nudge the direction text onto the same axis as the stop names
       below it. The grid puts this cell at badge + column-gap; a stop
       name sits at the dot column + its name gap, and the dot column is
       inset from the badge's right border by half a dot less half the
       stroke. The difference is what's added back here — 6px at the
       default tokens. Wide cards only: on narrow ones the trail runs
       flush left, so the stop names are far to the LEFT of the direction
       and closing the gap would drag this text under the badge. */
    .towards {
      margin-left: calc(
        var(--stops-ahead-dot-size) / 2 - var(--stops-ahead-line-width) / 2 +
          var(--stops-ahead-name-gap) - var(--wl-dep-col-gap)
      );
    }
    /* Trail is indented out here, so it leaves the badge's trailing
       edge — square that corner instead of the leading one. */
    .dep-row.expanded .line-badge {
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 0;
    }
    /* Hero trail gets the same badge connector as a departure row, but
       only at this width: .hero-detail moves into grid column 2 here
       (below), so it finally shares a left edge with .hero-entry and
       therefore with the badge that starts it. Narrow cards span the
       panel across both columns for station-name width, which puts its
       left edge left of the badge entirely — nothing to connect to, and
       the narrow hero is deliberately left exactly as it was before the
       connector existed. */
    .hero {
      /* Leading edge, not trailing. A departure row can afford to indent
         its trail out to the badge's right border because the row is a
         grid and the stop names get the whole 1fr column back. The hero
         panel is a single column under a much larger metric, so pushing
         the trail a badge-width right just eats station-name space for
         symmetry nobody asked for. Flush left it is — same value the
         narrow departure list uses. */
      --wl-hero-trail-x: calc(var(--stops-ahead-dot-size) / 2);
    }
    /* Shifts the badge's left border onto the stroke, rather than the
       stroke onto the border — the trail can't go further left without
       negative padding. Same trick, and same 4px, as .dep-row. */
    .hero-entry {
      padding-left: var(--wl-row-pad-left);
      /* The first entry shares its grid row with .hero-time, which is far
         taller than a badge. Under the grid's align-items: center that
         entry's own box is only badge-height, floating mid-row — so a
         stub measured from its bottom edge stopped short of the panel by
         half the height difference, and only ever on the first entry.
         Stretching the box to fill the row puts its bottom edge where the
         row actually ends; the flex content inside stays centred, so the
         badge does not move and top: 50% is still its centre.

         Since .hero-time's negative margins cancel its footprint this
         is a no-op in practice — row 1 is now entry-height like the
         rest. Kept as a guard so the stub still lands correctly if
         anything ever makes row 1 taller than its entry again. */
      align-self: stretch;
    }
    .hero-detail .stops-ahead {
      padding-left: calc(
        var(--wl-hero-trail-x) - var(--stops-ahead-dot-size) / 2
      );
    }
    /* First stop gets an upper segment so the line reaches the panel's
       top edge and meets the stub. Outside this query the hero's first
       stop deliberately has none. */
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
    /* Runs from the badge's centre — .line-badge paints over the upper
       half — down past the grid's row gap to the panel below. Assumes
       .hero-entry has not wrapped; at this width it is a single line. */
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
    /* Left corner: the hero trail leaves the badge's leading edge, not
       its trailing one. */
    .hero-entry.expanded .line-badge {
      border-bottom-left-radius: 0;
    }
    .hero > .hero-detail {
      grid-column: 2;
    }
  }

  /* Accessibility primitives — verbatim from the project spec. */
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
  /* …except the round icon buttons, which would otherwise take a
     rounded-rect ring around a circular surface. */
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

  /* First-paint stagger (frontend-design audit) — subtle cascading
     reveal on initial mount. Each departure row inlines its
     position-in-list via style="--row-i: N"; the keyframe runs once
     forwards. Capped at 6 rows so long lists don't take ages to
     settle. The motion-reduce catch-all below collapses the
     animation duration to 0.01ms, leaving the end-state visible
     instantly for users who opt out. */
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
  }
`,ze="wl-austria-fonts";const Ee="#1b1464";var Te={editor:{add_chip:"Chip hinzufügen",add_icon:"Symbol hinzufügen",date_format_placeholder:"d.m.Y",direction_label:"Fahrtrichtung",direction_not_served:"nicht bedient",direction_note_one_way:"Rückfahrt deaktiviert: {line} endet hier.",direction_unavailable:"Keine Abfahrten in dieser Richtung",header_amenities:"Symbole in diesem Slot",header_bar_aria:"Stationsanzeige — Seite wählen",header_chips_and_icons:"Textchips (max. {chips}) und Extra-Symbole (max. {icons})",header_left:"Linke Seite",header_pick_side_hint:"Seite antippen, dann unten füllen",header_right:"Rechte Seite",header_side_aria:"Seite der Stationsanzeige",header_slot_empty:"leer",line_active_aria:"Linie {line} aktiv",line_inactive_aria:"Linie {line} inaktiv",lines_empty_means_all:"leer = alle Linien",lines_label:"Linien an dieser Haltestelle",lines_selected:"{n} von {total}",no_lines_hint:"Wähle zuerst eine Haltestelle — die Linien kommen live aus der API.",no_lines_title:"Noch keine Linien verfügbar",per_line_direction_aria:"Linie {line}: {direction}",remove_chip_aria:"Chip {chip} entfernen",remove_icon_aria:"Symbol {icon} entfernen",remove_stop:"Haltestelle entfernen",section_board:"Fallblatt-Tafel",section_extras:"Extras",section_extras_hint:"optional",section_footer:"Fußzeile",section_header:"Stationsanzeige",section_header_hint:"Direkt am Balken",section_led_panel:"LED-Anzeige",section_station:"Stationsband",section_walk_time:"Gehzeit zur Haltestelle",show_clock_short:"Uhr",show_date_short:"Datum",show_elevator_short:"Lift",show_escalator_short:"Rolltreppe",show_wc_short:"WC",size_medium:"Mittel",size_regular:"Standard",size_small:"Klein",tab_display:"Anzeige",tab_stop:"Stop",tab_stops:"Stops",tab_tweaks:"Stil",text_placeholder:"z. B. Name der nächsten Station",walk_time_aria:"Gehzeit in Minuten für Linie {line} Richtung {towards}",walk_time_branching_hint:"Gilt für alle Endstationen in dieser Richtung",walk_time_hint:"Blendet Abfahrten aus, die ohne dich abfahren würden. Leer = kein Filter.",walk_time_less_aria:"Gehzeit für Linie {line} verringern",walk_time_more_aria:"Gehzeit für Linie {line} erhöhen",walk_time_placeholder:"–",walk_time_unit:"Minuten"}},Ce={no_data:"Keine Abfahrten verfügbar",betriebsschluss:"Betriebsschluss",stale_feed:"Keine aktuellen Daten",stale_feed_detail:"Die Wiener Linien melden für diese Haltestelle veraltete Abfahrtszeiten. Sobald wieder Echtzeitdaten kommen, füllt sich die Anzeige automatisch.",stale_feed_since:"Letzte gemeldete Abfahrt: {time}",stale_feed_partial:"Einzelne Linien melden keine aktuellen Zeiten.",min:"Min",now:"Jetzt",platform_short_rail:"Gleis",platform_short_bus:"Steig",version_update:"Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließen Sie diesen Browser-Tab und öffnen Sie das Dashboard erneut, oder löschen Sie die Website-Daten für Home Assistant in den Browser-Einstellungen.",entity_missing:"Sensor {entity} existiert nicht mehr. Wählen Sie einen anderen Sensor oder entfernen Sie ihn aus den Haltestellen dieser Karte.",no_entities_picked:"Keine Haltestelle ausgewählt",no_entities_available:"Keine Wiener-Linien-Sensoren gefunden",departures_list:"Kommende Abfahrten",barrier_free_title:"Barrierefrei zugänglich",cooling_title:"Klimatisiert",disturbance_title:"Verkehrsbehinderung gemeldet",stops_ahead_aria_show:"Streckenverlauf für {line} Richtung {towards} anzeigen",stops_ahead_aria_hide:"Streckenverlauf für {line} Richtung {towards} ausblenden",stops_ahead_transfer_aria:"Umsteigen auf {lines}",stops_ahead_other_show:"{count} weitere Linien bei {stop} anzeigen",stops_ahead_other_hide:"Weitere Linien bei {stop} ausblenden",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",dir_both:"Beide",traffic_label:"Störung",traffic_until:"Bis",traffic_updated:"aktualisiert",elevator_label:"Aufzug außer Betrieb",elevator_until:"Bis",open_in_maps:"In Karte öffnen",qr_open:"QR-Code anzeigen",qr_dialog_title:"QR-Code für Haltestelle",qr_dialog_hint:"Mit dem Smartphone scannen — öffnet die Haltestelle in der Karten-App.",qr_dialog_close:"QR-Code schließen",delay_singular:"1 Min. verspätet",delay_plural:"{n} Min. verspätet",devmode_title:"DEV",devmode_traffic_btn:"Störung testen",devmode_elevator_btn:"Aufzug testen",devmode_colors_btn:"Linienfarben",devmode_clear_btn:"Löschen",editor:{accessibility_only:"Nur barrierefreie Abfahrten anzeigen",accessibility_only_requires:"Braucht „Barrierefrei-Symbol anzeigen“.",colors_empty_hint:"Wähle im Reiter Stops Haltestellen aus — die Linien erscheinen dann hier.",colors_hint:"Optional. Ohne Überschreibung gilt die offizielle Linienfarbe.",hide_attribution:"Datenquelle ausblenden",hide_attribution_helper:"Wenn aktiv, wird die Quellenangabe ausgeblendet.",hide_header:"Kopfzeile ausblenden",hide_header_helper:"Wenn aktiv, wird die Titelleiste der Karte ausgeblendet.",layout:"Layout mehrerer Haltestellen",layout_requires:"Wirkt erst ab zwei Haltestellen.",layout_stacked:"Gestapelt",layout_tabs:"Reiter",max_departures:"Anzahl Abfahrten pro Haltestelle",pick_color_for_line:"Farbe für Linie {line} wählen",reset_color:"Auf Standard zurücksetzen",reset_color_aria:"Linienfarbe {line} auf Standard zurücksetzen",section_colors:"Linienfarben",section_colors_hint:"überschreibt API-Farbe",section_departure_row:"Abfahrtszeile",section_departure_row_hint:"pro Zeile",section_display:"Anzeige",section_disruptions:"Störungen & Verspätungen",section_layout:"Aufbau",section_layout_hint:"Struktur",show_accessibility:"Barrierefrei-Symbol anzeigen",show_cooling:"Klimaanlagen-Symbol anzeigen",show_cooling_helper:"Zeigt eine Schneeflocke neben Abfahrten mit klimatisiertem Fahrzeug. Wiener Linien melden das pro Fahrzeug — ältere Garnituren liefern die Angabe nicht.",show_delay:"Verspätungen anzeigen",show_delay_colors:"Verspätungen farblich hervorheben",show_delay_colors_helper:"Färbt die Minutenzahl rot, wenn eine Abfahrt verspätet ist, und grün, wenn sie zu früh kommt.",show_delay_colors_requires:"Braucht „Verspätungen anzeigen“.",show_departures:"Abfahrtsliste anzeigen",show_elevator_info:"Aufzugsausfälle anzeigen",show_hero_metric:"Nächste Abfahrt groß anzeigen",show_platform:"Gleis/Steig anzeigen",show_qr_button:"QR-Code-Schaltfläche anzeigen",show_stops_ahead:"Zwischenstationen anzeigen",show_traffic_info:"Störungen anzeigen",show_type_icon:"Verkehrsmittel-Symbol anzeigen"}},Me={editor:{accessibility_only:"Nur barrierefreie Abfahrten anzeigen",chips:"Zusätzliche Beschriftungen",chips_helper:"Kurze Beschriftungen nach den Symbolen (z. B. Gleis- oder Liniennummern). Maximal 6 pro Seite, je 16 Zeichen.",date_format:"Datumsformat",date_format_helper:"Beispiel: d.m.Y → 25.05.2026. Zeichen: d j (Tag), m n (Monat), Y y (Jahr), D l (Wochentag), M F (Monatsname). Alles andere bleibt unverändert.",exit:"Ausgangssymbol",extra_icons:"Zusätzliche Symbole",extra_icons_helper:"Bis zu 3 MDI-Symbole pro Seite. Im Katalog suchen oder einen mdi:-Schlüssel einfügen.",flicker:"LED-Flackern simulieren",header_exit_accessible:"Stufenloser Ausgang",header_exit_none:"Kein",header_exit_regular:"Ausgang",housing:"LED-Gehäuserahmen anzeigen",housing_helper:"Dunkler Rahmen um die LED-Anzeige mit dezentem Glas-Reflex obenauf.",icon_mdi_door_open:"Offene Tür",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_stairs:"Treppe",line_stripe:"Seitlichen Linienstreifen anzeigen",line_stripe_helper:"4-Pixel-Balken am linken Rand jeder Zeile in der Linienfarbe.",message_text:"Nachricht",message_text_requires:"Braucht „Lauftext anzeigen“.",message_ticker:"Laufschrift",message_ticker_helper:"Zeigt alle 5 Minuten eine eigene Nachricht als Laufschrift über die Anzeige.",platform_side:"Gleis/Steig-Seite",platform_side_auto:"Automatisch (1 = rechts, 2 = links)",platform_side_helper:"Standard folgt der Wiener-Linien-Beschilderung (Gleis 2 links, sonst rechts). Manuell überschreibbar.",platform_side_left:"Immer links",platform_side_requires:"Braucht „Steig anzeigen“.",platform_side_right:"Immer rechts",section_display:"Anzeige",section_display_hint:"LED-Feld",section_header_hint:"Direkt am Balken",show_clock:"Uhr-Plakette anzeigen",show_clock_helper:"Aktuelle Uhrzeit (HH:MM) als weiße Plakette am innen liegenden Rand dieser Seite.",show_date:"Datums-Plakette anzeigen",show_date_helper:"Aktuelles Datum als weiße Plakette neben der Uhr.",show_header:"Stationsanzeige anzeigen",show_header_helper:"Hauptschalter. Einstellungen pro Seite bleiben gespeichert.",show_line_pill:"Linien-Plakette anzeigen",show_line_pill_helper:"Liniencode als gefüllte Plakette in der Linienfarbe statt als schlichter Text.",show_platform:"Steig anzeigen",show_station_name:"Stationsnamen anzeigen",show_unit:"Einheit „min“ anzeigen",show_unit_helper:"Kleines „min“ in Amber-Versalien nach jeder Minutenzahl.",size:"Größe",station_bg:"Stationsschild-Hintergrund",station_bg_black:"Schwarz",station_bg_default:"Standard",station_bg_white:"Weiß",style:"Stil",style_classic:"Klassisch",style_pixel:"Punktmatrix",style_warm:"Warm",text:"Beschriftung",text_helper:"z. B. Name der nächsten Station.",wheelchair_race:"Rollstuhl-Rennen (Easter Egg)"},aria_dismiss_message:"Lauftext schließen",aria_start_race:"Barrierefreiheits-Rennen starten",at_platform:"Einfahrt",barrier_free_title:"Barrierefrei zugänglich",betriebsschluss:"Betriebsschluss",countdown_minutes:"{n} Minuten",departures_list:"Kommende Abfahrten",dir_both:"Beide",dir_h:"Hinfahrt",dir_h_short:"H",dir_r:"Rückfahrt",dir_r_short:"R",entity_missing:"Sensor {entity} existiert nicht mehr. Wählen Sie oben einen anderen Sensor.",gleis:"GLEIS",header:{icon_exit:"Ausgang",icon_exit_access:"Stufenloser Ausgang",icon_wc:"WC",icon_escalator:"Rolltreppe",icon_elevator:"Aufzug",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_door_open:"Offene Tür",icon_mdi_stairs:"Treppe"},no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",no_entity:"Keine Haltestelle ausgewählt",race_finished:"Barrierefreiheits-Rennen beendet",race_starting_in:"Rennen startet in {n}",race_winner_announce:"Rollstuhl {n} gewinnt das Barrierefreiheits-Rennen",stale_feed:"Keine aktuellen Daten",steig:"STEIG",unit_min:"min",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließen Sie diesen Browser-Tab und öffnen Sie das Dashboard erneut, oder löschen Sie die Website-Daten für Home Assistant in den Browser-Einstellungen.",version_update:"Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden",via_prefix:"ÜBER"},Le={no_entity:"Keine Haltestelle ausgewählt",no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",betriebsschluss:"Betriebsschluss",stale_feed:"Keine aktuellen Daten",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",gleis:"GLEIS",steig:"STEIG",col_line:"LINIE",col_dest:"RICHTUNG",col_step_free:"STUFENLOS",col_cd:"ANKUNFT",version_update:"Klappanzeige wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließen Sie diesen Browser-Tab und öffnen Sie das Dashboard erneut, oder löschen Sie die Website-Daten für Home Assistant in den Browser-Einstellungen.",entity_missing:"Sensor {entity} existiert nicht mehr. Wählen Sie oben einen anderen Sensor.",departures_list:"Kommende Abfahrten",at_platform:"Einfahrt",countdown_minutes:"{n} Minuten",barrier_free_title:"Barrierefrei zugänglich",not_barrier_free_title:"Nicht barrierefrei",unit_min:"min",dir_both:"Beide",header:{icon_exit:"Ausgang",icon_exit_access:"Stufenloser Ausgang",icon_wc:"WC",icon_escalator:"Rolltreppe",icon_elevator:"Aufzug",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_door_open:"Offene Tür",icon_mdi_stairs:"Treppe"},editor:{accessibility_only:"Nur barrierefreie Abfahrten anzeigen",accessibility_only_requires:"Braucht „Rollstuhl-Plakette anzeigen“.",chips:"Zusätzliche Beschriftungen",chips_helper:"Kurze Beschriftungen nach den Symbolen (z. B. Gleis- oder Liniennummern). Maximal 6 pro Seite, je 16 Zeichen.",date_format:"Datumsformat",date_format_helper:"Beispiel: d.m.Y → 25.05.2026. Zeichen: d j (Tag), m n (Monat), Y y (Jahr), D l (Wochentag), M F (Monatsname). Alles andere bleibt unverändert.",entities:"Haltestellen",exit:"Ausgangssymbol",extra_icons:"Zusätzliche Symbole",extra_icons_helper:"Bis zu 3 MDI-Symbole pro Seite. Im Katalog suchen oder einen mdi:-Schlüssel einfügen.",header_exit_accessible:"Stufenloser Ausgang",header_exit_none:"Kein",header_exit_regular:"Ausgang",hide_attribution:"Datenquelle ausblenden",hide_attribution_helper:"Wenn aktiv, wird die CC-BY-Quellenangabe am unteren Rand der Karte ausgeblendet. Die OGD-Lizenz der Wiener Linien verlangt eine sichtbare Quellenangabe, sofern der Hinweis nicht an anderer Stelle im Dashboard erscheint.",housing:"Gehäuserahmen anzeigen",housing_helper:"Umrahmt die Tafel mit dem Gehäuse inkl. dezenter Innenkante und Schlagschatten. Gehäusefarbe folgt dem HA-Theme (cremefarben im Hellmodus, dunkel im Dunkelmodus). Aus = Tafel sitzt bündig auf dem Dashboard.",icon_mdi_door_open:"Offene Tür",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_stairs:"Treppe",max_rows:"Anzahl Zeilen",max_rows_helper:"Wie viele Abfahrten die Tafel zeigt (1–8). Über alle Haltestellen zusammengeführt, nach Abfahrtszeit sortiert.",section_display:"Anzeige",section_display_hint:"Fallblatt-Feld",section_station_helper:"Das farbige Band mit Stationsname und Uhrzeit am oberen Rand der Tafel.",show_accessibility:"Rollstuhl-Plakette anzeigen",show_accessibility_helper:"Zeigt eine Rollstuhl-Plakette neben barrierefreien Abfahrten.",show_clock:"Uhr-Plakette anzeigen",show_clock_helper:"Aktuelle Uhrzeit (HH:MM) als cremefarbene Plakette am innen liegenden Rand dieser Seite.",show_date:"Datums-Plakette anzeigen",show_date_helper:"Aktuelles Datum als cremefarbene Plakette neben der Uhr.",show_header:"Stationsanzeige anzeigen",show_header_helper:"Hauptschalter. Einstellungen pro Seite bleiben gespeichert.",show_line_column:"Linienspalte anzeigen",show_line_column_helper:"Zeigt die Spalte mit dem Liniencode. Ausschalten, wenn die Tafel ohnehin nur eine Linie zeigt.",show_min_unit:"Einheit „min“ anzeigen",show_min_unit_helper:"Kleines „min“ neben der Minutenzahl, wie auf echten Stationstafeln.",show_platform:"Gleis/Steig anzeigen",show_platform_helper:"Fügt jeder Zeile eine eigene Gleis-Plakette zwischen Ziel und Minutenzahl hinzu. Wird nur eingeblendet, wenn mindestens eine sichtbare Zeile einen Gleis-Wert hat.",show_station_name:"Stationsnamen anzeigen",show_station_name_helper:"Farbiges Band mit Stationsname und Uhrzeit am oberen Rand der Karte.",size:"Größe",station_bg:"Hintergrund Stationsschild",station_bg_black:"Schwarz",station_bg_helper:"Standard ist die Farbe der ersten erfassten Linie (z. B. Rot für U1, Orange für U3). Bei mehreren Linien kann eine bestimmte Linie gewählt oder auf Weiß bzw. Schwarz umgestellt werden.",station_bg_line:"Erste Linie",station_bg_white:"Weiß",text:"Beschriftung",text_helper:"z. B. Name der nächsten Station.",walk_time_no_data:"Keine passenden Abfahrten. Richtung wechseln oder warten, bis der Sensor Linien meldet."}},Re={common:Te,modern:Ce,retro:Me,flap:Le},He={editor:{add_chip:"Add chip",add_icon:"Add icon",date_format_placeholder:"d.m.Y",direction_label:"Direction",direction_not_served:"not served",direction_note_one_way:"Return direction disabled: {line} terminates here.",direction_unavailable:"No departures in this direction",header_amenities:"Icons in this slot",header_bar_aria:"Station sign — choose a side",header_chips_and_icons:"Text chips (max. {chips}) and extra icons (max. {icons})",header_left:"Left side",header_pick_side_hint:"Tap a side, then fill it in below",header_right:"Right side",header_side_aria:"Station sign side",header_slot_empty:"empty",line_active_aria:"Line {line} active",line_inactive_aria:"Line {line} inactive",lines_empty_means_all:"empty = all lines",lines_label:"Lines at this stop",lines_selected:"{n} of {total}",no_lines_hint:"Pick a stop first — lines arrive live from the API.",no_lines_title:"No lines yet",per_line_direction_aria:"Line {line}: {direction}",remove_chip_aria:"Remove chip {chip}",remove_icon_aria:"Remove icon {icon}",remove_stop:"Remove stop",section_board:"Split-flap board",section_extras:"Extras",section_extras_hint:"optional",section_footer:"Footer",section_header:"Station sign",section_header_hint:"Edit on the bar",section_led_panel:"LED panel",section_station:"Station band",section_walk_time:"Walking time to the stop",show_clock_short:"Clock",show_date_short:"Date",show_elevator_short:"Lift",show_escalator_short:"Escalator",show_wc_short:"WC",size_medium:"Medium",size_regular:"Standard",size_small:"Small",tab_display:"Display",tab_stop:"Stop",tab_stops:"Stops",tab_tweaks:"Style",text_placeholder:"e.g. name of the next station",walk_time_aria:"Walking time in minutes for line {line} towards {towards}",walk_time_branching_hint:"Applies to every terminus in this direction",walk_time_hint:"Hides departures that would leave without you. Empty = no filter.",walk_time_less_aria:"Decrease walking time for line {line}",walk_time_more_aria:"Increase walking time for line {line}",walk_time_placeholder:"–",walk_time_unit:"minutes"}},De={no_data:"No departures available",betriebsschluss:"End of service",stale_feed:"No live data",stale_feed_detail:"Wiener Linien is sending out-of-date departure times for this stop. Departures return automatically once live data resumes.",stale_feed_since:"Last reported departure: {time}",stale_feed_partial:"Some lines aren't reporting current times.",min:"min",now:"Now",platform_short_rail:"Track",platform_short_bus:"Bay",version_update:"Wiener Linien Austria updated to v{v} — please reload",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor, or remove it from this card's stops.",no_entities_picked:"No stop selected",no_entities_available:"No Wiener Linien sensors found",departures_list:"Upcoming departures",barrier_free_title:"Step-free access",cooling_title:"Air conditioned",disturbance_title:"Traffic disruption reported",stops_ahead_aria_show:"Show stops ahead for {line} towards {towards}",stops_ahead_aria_hide:"Hide stops ahead for {line} towards {towards}",stops_ahead_transfer_aria:"Change to {lines}",stops_ahead_other_show:"Show {count} more lines at {stop}",stops_ahead_other_hide:"Hide other lines at {stop}",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",dir_both:"Both",traffic_label:"Disruption",traffic_until:"Until",traffic_updated:"updated",elevator_label:"Elevator out of service",elevator_until:"Until",open_in_maps:"Open in maps",qr_open:"Show QR code",qr_dialog_title:"QR code for stop",qr_dialog_hint:"Scan with your phone — opens the stop in your maps app.",qr_dialog_close:"Close QR code",delay_singular:"1 min. late",delay_plural:"{n} min. late",devmode_title:"DEV",devmode_traffic_btn:"Test disruption",devmode_elevator_btn:"Test elevator",devmode_colors_btn:"Line colours",devmode_clear_btn:"Clear",editor:{accessibility_only:"Only show step-free departures",accessibility_only_requires:"Requires “Show accessibility icon”.",colors_empty_hint:"Pick stops on the Stops tab — their lines will show up here.",colors_hint:"Optional. Without an override the official line colour applies.",hide_attribution:"Hide data source",hide_attribution_helper:"When on, the data-source credit is hidden.",hide_header:"Hide header",hide_header_helper:"When on, the card title bar is hidden.",layout:"Multi-stop layout",layout_requires:"Only takes effect with two or more stops.",layout_stacked:"Stacked",layout_tabs:"Tabs",max_departures:"Departures per stop",pick_color_for_line:"Pick colour for line {line}",reset_color:"Reset to default",reset_color_aria:"Reset line colour {line} to default",section_colors:"Line colours",section_colors_hint:"overrides the API colour",section_departure_row:"Departure row",section_departure_row_hint:"per row",section_display:"Display",section_disruptions:"Disruptions & delays",section_layout:"Structure",section_layout_hint:"Layout",show_accessibility:"Show step-free icon",show_cooling:"Show air-conditioning icon",show_cooling_helper:"Shows a snowflake beside departures with an air-conditioned vehicle. Wiener Linien report this per vehicle — older trains and trams don't send it.",show_delay:"Show delays",show_delay_colors:"Colour-code delays",show_delay_colors_helper:"Turns the countdown number red when a departure runs late and green when it runs early.",show_delay_colors_requires:"Requires “Show delays”.",show_departures:"Show departure list",show_elevator_info:"Show elevator outages",show_hero_metric:"Show next departure large",show_platform:"Show platform / track",show_qr_button:"Show QR-code button",show_stops_ahead:"Show intermediate stops",show_traffic_info:"Show disruption alerts",show_type_icon:"Show vehicle-type icon"}},Oe={editor:{accessibility_only:"Only show step-free departures",chips:"Extra labels",chips_helper:"Short labels after the icons (e.g. platform or line numbers). Up to 6, 16 characters each.",date_format:"Date format",date_format_helper:"Example: d.m.Y → 25.05.2026. Tokens: d j (day), m n (month), Y y (year), D l (weekday), M F (month name). Anything else passes through unchanged.",exit:"Exit icon",extra_icons:"Extra icons",extra_icons_helper:"Pick up to 3 MDI icons per side. Type to search the catalog, or paste an mdi: key.",flicker:"Simulate LED flicker",header_exit_accessible:"Step-free exit",header_exit_none:"None",header_exit_regular:"Exit",housing:"Show LED cabinet frame",housing_helper:"Dark bezel around the LED panel with a subtle glass reflection on top.",icon_mdi_door_open:"Open door",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_stairs:"Stairs",line_stripe:"Show line stripe",line_stripe_helper:"A 4 px coloured bar at the left edge of each row, matched to the line.",message_text:"Message",message_text_requires:"Requires “Show ticker”.",message_ticker:"Scrolling message",message_ticker_helper:"Runs a custom message across the display every 5 minutes.",platform_side:"Platform side",platform_side_auto:"Auto (1 = right, 2 = left)",platform_side_helper:"Default follows Wiener Linien signage (platform 2 on the left, otherwise right). Override manually if needed.",platform_side_left:"Always left",platform_side_requires:"Requires “Show platform”.",platform_side_right:"Always right",section_display:"Display",section_display_hint:"LED panel",section_header_hint:"Edit on the bar",show_clock:"Show clock chip",show_clock_helper:"Current time (HH:MM) as a white chip at the innermost edge of this side.",show_date:"Show date chip",show_date_helper:"Current date as a white chip next to the clock.",show_header:"Show station sign",show_header_helper:"Master switch. Per-side settings are kept.",show_line_pill:"Show line badge",show_line_pill_helper:"Renders the line code as a filled badge in the line colour rather than plain text.",show_platform:"Show platform",show_station_name:"Show station name",show_unit:"Show the “min” unit",show_unit_helper:'Trail each countdown number with a small amber "min" caption.',size:"Size",station_bg:"Station-name background",station_bg_black:"Black",station_bg_default:"Default",station_bg_white:"White",style:"Style",style_classic:"Classic",style_pixel:"Dot matrix",style_warm:"Warm",text:"Sign text",text_helper:"E.g. name of the next station.",wheelchair_race:"Wheelchair race (easter egg)"},aria_dismiss_message:"Dismiss scrolling message",aria_start_race:"Start accessibility race",at_platform:"Arriving",barrier_free_title:"Step-free access",betriebsschluss:"End of service",countdown_minutes:"{n} minutes",departures_list:"Upcoming departures",dir_both:"Both",dir_h:"Outbound",dir_h_short:"H",dir_r:"Return",dir_r_short:"R",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.",gleis:"PLATF.",header:{icon_exit:"Exit",icon_exit_access:"Step-free exit",icon_wc:"Toilet",icon_escalator:"Escalator",icon_elevator:"Elevator",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_door_open:"Open door",icon_mdi_stairs:"Stairs"},no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",no_entity:"No stop selected",race_finished:"Accessibility race finished",race_starting_in:"Race starting in {n}",race_winner_announce:"Wheelchair {n} wins the accessibility race",stale_feed:"No live data",steig:"BAY",unit_min:"min",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",version_update:"Retro card updated to v{v} — please reload",via_prefix:"VIA"},Pe={no_entity:"No stop selected",no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",betriebsschluss:"End of service",stale_feed:"No live data",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",gleis:"GLEIS",steig:"BAY",col_line:"LINE",col_dest:"DIRECTION",col_step_free:"STEP-FREE",col_cd:"ARRIVAL",version_update:"Flap card updated to v{v} — please reload",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.",departures_list:"Upcoming departures",at_platform:"Arriving",countdown_minutes:"{n} minutes",barrier_free_title:"Step-free access",not_barrier_free_title:"Step-free access not available",unit_min:"min",dir_both:"Both",header:{icon_exit:"Exit",icon_exit_access:"Step-free exit",icon_wc:"Toilet",icon_escalator:"Escalator",icon_elevator:"Elevator",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_door_open:"Open door",icon_mdi_stairs:"Stairs"},editor:{accessibility_only:"Only show step-free departures",accessibility_only_requires:"Requires “Show wheelchair badge”.",chips:"Extra labels",chips_helper:"Short labels after the icons (e.g. platform or line numbers). Up to 6, 16 characters each.",date_format:"Date format",date_format_helper:"Example: d.m.Y → 25.05.2026. Tokens: d j (day), m n (month), Y y (year), D l (weekday), M F (month name). Anything else passes through unchanged.",entities:"Stops",exit:"Exit icon",extra_icons:"Extra icons",extra_icons_helper:"Pick up to 3 MDI icons per side. Type to search the catalog, or paste an mdi: key.",header_exit_accessible:"Step-free exit",header_exit_none:"None",header_exit_regular:"Exit",hide_attribution:"Hide data source",hide_attribution_helper:"When on, the CC-BY credit at the bottom of the card is hidden. The Wiener Linien Open Government Data licence requires visible attribution unless you keep the credit elsewhere on the dashboard.",housing:"Show cabinet frame",housing_helper:"Wraps the board in the cabinet with a soft inset bevel and drop shadow. Cabinet colour follows your HA theme (cream on light, dark on dark). When off, the board sits flush against the dashboard.",icon_mdi_door_open:"Open door",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_stairs:"Stairs",max_rows:"Number of rows",max_rows_helper:"How many departures to show on the board (1–8). Merged across all stops, sorted by countdown.",section_display:"Display",section_display_hint:"Split-flap board",section_station_helper:"The coloured band with the station name + clock at the top of the board.",show_accessibility:"Show step-free tile",show_accessibility_helper:"Add a wheelchair pictogram tile next to step-free departures.",show_clock:"Show clock chip",show_clock_helper:"Current time (HH:MM) as a cream chip at the innermost edge of this side.",show_date:"Show date chip",show_date_helper:"Current date as a cream chip next to the clock.",show_header:"Show station sign",show_header_helper:"Master switch. Per-side settings are kept.",show_line_column:"Show line column",show_line_column_helper:"Shows the column carrying the line code. Turn it off when the board only ever shows one line.",show_min_unit:'Show "min" caption',show_min_unit_helper:"Small label next to the countdown number, like real station boards.",show_platform:"Show platform / track",show_platform_helper:"Adds a per-row platform tile between the destination and the countdown. Only shown when at least one visible row has a platform value.",show_station_name:"Show station name",show_station_name_helper:"Coloured band with the station name and current time at the top of the card.",size:"Size",station_bg:"Station-name background",station_bg_black:"Black",station_bg_helper:"Default is the colour of the first tracked line (e.g. red for U1, orange for U3). On multi-line boards you can pick a specific line, or override with solid white or black.",station_bg_line:"First line",station_bg_white:"White",text:"Sign text",text_helper:"E.g. name of the next station.",walk_time_no_data:"No departures matched. Pick a direction or wait until the sensor reports lines."}},Ne={common:He,modern:De,retro:Oe,flap:Pe};const Ue={de:Object.freeze({__proto__:null,common:Te,default:Re,flap:Le,modern:Ce,retro:Me}),en:Object.freeze({__proto__:null,common:He,default:Ne,flap:Pe,modern:De,retro:Oe})},Be=Ue.de??{};function qe(e,t){const i=function(e,t){return e.split(".").reduce((e,t)=>{if(e&&"object"==typeof e&&t in e)return e[t]},t)}(e,t);return"string"==typeof i?i:void 0}function je(e,t,i){const r=function(e){return"en"===((e.configLanguage||e.hassLanguage||"de").split(/[-_]/)[0]??"de")?"en":"de"}(t);let n=qe(e,Ue[r]??Be);if(void 0===n&&(n=qe(e,Be)),void 0===n)return e;if(i)for(const[e,t]of Object.entries(i))n=n.replace(`{${e}}`,String(t));return n}function We(e,t,i="banner"){if(!e)return I;if(function(e){if(!e)return!1;try{return"1"===window.sessionStorage?.getItem(`wl-reload-attempted-${e}`)}catch{return!1}}(e)){const e=t("version_reload_stuck");return W`
      <div class=${i} role="alert" aria-live="assertive">
        <span>${e}</span>
      </div>
    `}const r=t("version_update").replace("{v}",e),n=t("version_reload");return W`
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
  `}function Fe(e,t){return e?W`<span lang="de">${e}</span>`:t??""}const Ie="ptMetro";function Ve(e){switch(e){case Ie:return"mdi:subway-variant";case"ptTram":return"mdi:tram";case"ptBusCity":case"ptBusNight":return"mdi:bus";default:return null}}function Ge(e,t){return"boolean"==typeof e?e:t}function Ke(e){if("string"==typeof e)return e.startsWith("sensor.")?{entity:e}:(console.warn(`[wiener-linien-austria] entities[] entry ${JSON.stringify(e)} is not a sensor.* entity — dropping`),null);if(!e||"object"!=typeof e)return console.warn(`[wiener-linien-austria] entities[] entry ${JSON.stringify(e)} is not a string or object — dropping`),null;const t=e,i="string"==typeof t.entity?t.entity:null;if(!i?.startsWith("sensor."))return console.warn("[wiener-linien-austria] entities[] entry has missing or non-sensor.* entity field",e),null;const r={entity:i};if(Array.isArray(t.lines)){const e=t.lines.filter(e=>"string"==typeof e&&e.length>0);e.length&&(r.lines=e)}"H"!==t.direction&&"R"!==t.direction||(r.direction=t.direction);const n=function(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,r]of Object.entries(e)){if("string"!=typeof i||!i.length)continue;const e=i.toUpperCase();"H"!==r&&"R"!==r?void 0!==r&&""!==r&&"Both"!==r&&console.warn(`[wiener-linien-austria] line_directions["${i}"] = ${JSON.stringify(r)} is not "H" / "R" / "Both" — dropping`):t[e]=r}return Object.keys(t).length?t:void 0}(t.line_directions);n&&(r.line_directions=n);const a=function(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,r]of Object.entries(e)){const e="number"==typeof r?r:"string"==typeof r?Number(r):NaN;if(!Number.isFinite(e)||e<0||e>120){console.warn(`[wiener-linien-austria] walk_times["${i}"] = ${JSON.stringify(r)} is not a finite number in 0..120 — dropping`);continue}const n=i.split("|"),a=n.length>=3?`${n[0]}|${n[1]}`:i,o=Math.round(e),s=t[a];t[a]=void 0===s?o:Math.max(s,o)}return Object.keys(t).length?t:void 0}(t.walk_times);return a&&(r.walk_times=a),r}const Qe=new Set(["type","entities","entity","lines","direction","walk_times","max_departures","line_colors","show_accessibility","accessibility_only","show_cooling","show_traffic_info","show_elevator_info","show_delay","show_delay_colors","show_type_icon","show_platform","show_hero_metric","show_departures","show_stops_ahead","show_qr_button","hide_header","hide_attribution","layout"]),Ze=6,Ye=!1,Je=!1,Xe=!1,et=!0,tt=!0,it=!0,rt=!0,nt=!1,at=!0,ot=!0,st=!0,lt=!0,dt=!0,ct=!1,ht=!1;function pt(e){let t=[];Array.isArray(e.entities)?t=e.entities:"string"==typeof e.entity&&(t=[{entity:e.entity,lines:e.lines,direction:e.direction,walk_times:e.walk_times}]);const i=[],r=new Set;for(const e of t){const t=Ke(e);t&&(r.has(t.entity)||(r.add(t.entity),i.push(t)))}const n=Number(e.max_departures),a=Number.isFinite(n)?Math.max(0,Math.min(20,Math.round(n))):Ze,o={};if(e.line_colors&&"object"==typeof e.line_colors){const t=/^#(?:[0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;for(const[i,r]of Object.entries(e.line_colors))"string"==typeof r&&t.test(r.trim())&&(o[i.toUpperCase()]=r.trim())}const s=function(e,t){const i={};if(!e||"object"!=typeof e)return i;for(const[r,n]of Object.entries(e))t.has(r)||(i[r]=n);return i}(e,Qe);return{...s,type:"string"==typeof e.type&&e.type?e.type:"custom:wiener-linien-austria-card",entities:i,max_departures:a,line_colors:o,show_accessibility:Ge(e.show_accessibility,Ye),accessibility_only:Ge(e.accessibility_only,Je),show_cooling:Ge(e.show_cooling,Xe),show_traffic_info:Ge(e.show_traffic_info,et),show_elevator_info:Ge(e.show_elevator_info,tt),show_delay:Ge(e.show_delay,it),show_delay_colors:Ge(e.show_delay_colors,rt),show_type_icon:Ge(e.show_type_icon,nt),show_platform:Ge(e.show_platform,at),show_hero_metric:Ge(e.show_hero_metric,ot),show_departures:Ge(e.show_departures,st),show_stops_ahead:Ge(e.show_stops_ahead,lt),show_qr_button:Ge(e.show_qr_button,dt),hide_header:Ge(e.hide_header,ct),hide_attribution:Ge(e.hide_attribution,ht),layout:"tabs"===e.layout?"tabs":"stacked"}}function ut(e,t,i={},r="var(--primary-color)"){const n=e.toUpperCase();if(void 0!==t[n])return{background:t[n]};if(/^N\d/.test(n))return{background:Ee,color:"#fef200"};const a=i[e]??i[n];return a?.bg?a.fg?{background:`#${a.bg}`,color:`#${a.fg}`}:{background:`#${a.bg}`}:{background:r}}function ft(e,t,i={},r="var(--primary-color)"){return ut(e,t,i,r).background}function gt(e){if(!e)return[];const t=[];for(const[i,r]of Object.entries(e.states??{})){if(!i.startsWith("sensor."))continue;const e=r?.attributes??{};"number"==typeof e.diva&&(Array.isArray(e.departures)&&e.next_by_line&&"object"==typeof e.next_by_line&&t.push(i))}return t.sort(),t}function _t(e,t){if(!e||!t)return{};const i=e.states?.[t]?.attributes;return i?.line_colors??{}}function mt(e,t){if(!e)return{};for(const i of t){const t=_t(e,i);if(Object.keys(t).length)return t}return{}}function wt(e,t){return`${e}|${t}`}function bt(e,t){if(!e.length)return t.full;const i=e.slice(0,3).join(" / "),r=e.length>3?" +"+(e.length-3):"";return`${t.short}: ${i}${r}`}function vt(e){if(e?.tracked_lines?.length)return[...e.tracked_lines].sort();const t=new Set;if(e?.lines_at_stop?.length)for(const i of e.lines_at_stop)t.add(i);for(const i of e?.departures??[])i.line&&t.add(i.line);return Array.from(t).sort()}function yt(e){return e.replace(/[^A-Za-z0-9_]/g,"_")}function xt(e,t){const i=new Set(e);return i.has(t)?i.delete(t):i.add(t),i}const $t=["Voraussichtliche Dauer","Grund"],kt=/^(Linien?\s+[^:]{1,60}):\s*/,St=new RegExp(`${kt.source}$`),At=new RegExp(`^(${$t.join("|")}):\\s*(.+)$`),zt=new RegExp(`(?<=\\S)\\s*(?=(?:${$t.join("|")}):)`,"g"),Et="mdi:information-outline",Tt=[[/bauarbeit|baustelle|gleisbau|bauma(ß|ss)nahme/i,"mdi:excavator"],[/verkehrsunfall|unfall|kollision|zusammensto(ß|ss)/i,"mdi:car-emergency"],[/rettung|sanit(ä|ae)|notarzt/i,"mdi:ambulance"],[/feuerwehr|brand/i,"mdi:fire-truck"],[/polizei/i,"mdi:police-badge"],[/demonstration|kundgebung|veranstaltung|umzug|marathon/i,"mdi:account-group"],[/schnee|eis|glatt/i,"mdi:snowflake"],[/sturm|unwetter|witterung|gewitter|hitze/i,"mdi:weather-lightning-rainy"],[/gebrechen|defekt|schaden|st(ö|oe)rung|reparatur|erneuerung|instandsetzung|ma(ß|ss)nahme|wartung/i,"mdi:wrench"]];const Ct=/^\d{1,2}[:.]\d{2}(\s*Uhr)?\.?$/i;function Mt(e){const t=e.trim();return t.endsWith(".")?/^\d+\.$/.test(t)?t:t.slice(0,-1):t}function Lt(e,t){if("Grund"===e){for(const[e,i]of Tt)if(e.test(t))return i;return Et}return"Voraussichtliche Dauer"===e?Ct.test(t.trim())?"mdi:clock-outline":"mdi:calendar-clock":Et}const Rt=new Set(["P","DIV","LI","UL","OL","TR","H1","H2","H3","H4","H5","H6"]),Ht=new Set(["SCRIPT","STYLE","TEMPLATE","IFRAME","SVG","NOSCRIPT"]);function Dt(e){const t=[];let i=e;const r=kt.exec(i);r&&(t.push(`${r[1]}:`),i=i.slice(r[0].length));for(const e of i.split(zt)){const i=e.trim();i&&t.push(i)}return t}function Ot(e){const t=[],i=[],r=new Set;for(const n of function(e){const t=(new DOMParser).parseFromString(e,"text/html"),i=[];let r="";const n=()=>{const e=r.replace(/\s+/g," ").trim();e&&i.push(e),r=""},a=e=>{const t=e.split(/\r?\n/);r+=t[0]??"";for(let e=1;e<t.length;e+=1)n(),r+=t[e]??""},o=e=>{const t=e.childNodes;for(let e=0;e<t.length;e+=1){const i=t[e];if(!i)continue;if(i.nodeType===Node.TEXT_NODE){a(i.nodeValue??"");continue}if(i.nodeType!==Node.ELEMENT_NODE)continue;const r=i.tagName.toUpperCase();Ht.has(r)||("BR"!==r?(o(i),Rt.has(r)&&n()):n())}};return o(t.body),n(),i}(String(e??"")))for(const e of Dt(n)){const n=At.exec(e);if(n?.[1]&&n[2]){if(r.has(n[1]))continue;r.add(n[1]);const e=Mt(n[2]);i.push({label:n[1],value:e,icon:Lt(n[1],e)});continue}const a=St.exec(e);a?.[1]?t.push({kind:"heading",text:a[1]}):t.push({kind:"para",text:e})}return{blocks:t,facts:i}}function Pt(e,t="de"){if(!e)return"";const i=Date.parse(e);if(!Number.isFinite(i))return e;try{return new Date(i).toLocaleString("en"===t?"en-GB":"de-AT",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"})}catch{return e}}const Nt=e=>Math.min(1,Math.max(0,e)),Ut=e=>e<=.04045?e/12.92:((e+.055)/1.055)**2.4,Bt=e=>e<=.0031308?12.92*e:1.055*e**(1/2.4)-.055;function qt(e){const t=e.trim();if(!t||t.includes("var("))return null;let i=/^#[0-9a-f]{3,8}$/i.test(t)?t.slice(1):"";if(!i){let e="";try{const i=document.createElement("span").style;i.color=t,e=i.color.trim()}catch{return null}const i=/^rgba?\(([^)]+)\)$/.exec(e);if(!i?.[1])return null;const r=i[1].split(/[,\s/]+/).filter(Boolean).map(Number),[n,a,o]=r;return void 0===n||void 0===a||void 0===o?null:[n,a,o].every(Number.isFinite)?[Ut(n/255),Ut(a/255),Ut(o/255)]:null}if(3!==i.length&&4!==i.length||(i=[...i.slice(0,3)].map(e=>e+e).join("")),6!==i.length&&8!==i.length)return null;const r=Number.parseInt(i.slice(0,6),16);return Number.isFinite(r)?[Ut((r>>16&255)/255),Ut((r>>8&255)/255),Ut((255&r)/255)]:null}const jt=([e,t,i])=>"#"+[e,t,i].map(e=>Math.round(255*Nt(Bt(e))).toString(16).padStart(2,"0")).join(""),Wt=([e,t,i])=>.2126*e+.7152*t+.0722*i;function Ft(e,t){if(void 0===t)return null;const i=qt(e);if(!i)return null;const[r,n,a]=function([e,t,i]){const r=Math.cbrt(.4122214708*e+.5363325363*t+.0514459929*i),n=Math.cbrt(.2119034982*e+.6806995451*t+.1073969566*i),a=Math.cbrt(.0883024619*e+.2817188376*t+.6299787005*i);return[.2104542553*r+.793617785*n-.0040720468*a,1.9779984951*r-2.428592205*n+.4505937099*a,.0259040371*r+.7827717662*n-.808675766*a]}(i),o="dark"===t?Math.max(.72,r):Math.min(.45,r);if(o===r)return jt(i);const s=Math.hypot(n,a),l=Math.atan2(a,n),d=function([e,t,i]){const r=(e+.3963377774*t+.2158037573*i)**3,n=(e-.1055613458*t-.0638541728*i)**3,a=(e-.0894841775*t-1.291485548*i)**3;return[4.0767416621*r-3.3077115913*n+.2309699292*a,-1.2684380046*r+2.6097574011*n-.3413193965*a,-.0041960863*r-.7034186147*n+1.707614701*a]}([o,s*Math.cos(l),s*Math.sin(l)]);return jt([Nt(d[0]),Nt(d[1]),Nt(d[2])])}const It=o`
  :host {
    display: block;
  }

  /* ---------------------------------------------------------------- *
   * Shell: tab bar + scrolling column
   * ---------------------------------------------------------------- */

  .wl-editor {
    display: flex;
    flex-direction: column;
  }

  /* Sticky so the tabs stay reachable while a long Anzeige tab scrolls.
     z-index beats ha-form's own focused-field elevation. */
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
    border: 0;
    background: transparent;
    cursor: pointer;
    padding: 12px 14px 0;
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

  /* The underline is a child element rather than a border-bottom so it can
     bleed past the button's horizontal padding to the full tab width. */
  .wl-tab-underline {
    display: block;
    height: 2px;
    margin: 7px -14px -1px;
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

  /* ---------------------------------------------------------------- *
   * Section
   * ---------------------------------------------------------------- */

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

  /* ha-form sets its own vertical rhythm between fields; the section already
     supplies the outer padding, so strip the top gap it would add. */
  .wl-section-body ha-form {
    display: block;
  }

  /* ---------------------------------------------------------------- *
   * Bespoke rows (chips / direction / walk time / colour)
   * ---------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------- *
   * Line chip — 34px tall for density, 44px hit area for WCAG 2.2 (2.5.8).
   * The ::before overlay is what buys both; do not replace it with padding.
   * ---------------------------------------------------------------- */

  .wl-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .wl-chip {
    --wl-chip-color: var(--primary-color);
    position: relative;
    display: flex;
    align-items: center;
    gap: 5px;
    height: 34px;
    padding: 0 10px;
    border-radius: 5px;
    border: 2px solid var(--wl-chip-color);
    background: transparent;
    color: var(--wl-chip-color);
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
    color: #fff;
  }

  .wl-chip:hover {
    background: color-mix(in srgb, var(--wl-chip-color) 16%, transparent);
  }

  .wl-chip[aria-pressed="true"]:hover {
    background: color-mix(in srgb, var(--wl-chip-color) 88%, #000);
  }

  /* Offset outline rather than box-shadow: on a chip filled with its own line
     colour a shadow-based ring disappears into the fill. */
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

  /* ---------------------------------------------------------------- *
   * Read-only line badge
   * ---------------------------------------------------------------- */

  .wl-badge {
    flex: none;
    min-width: 34px;
    height: 24px;
    padding: 0 7px;
    box-sizing: border-box;
    border-radius: 5px;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 24px;
    text-align: center;
    forced-color-adjust: none;
  }

  /* ---------------------------------------------------------------- *
   * Direction buttons
   * ---------------------------------------------------------------- */

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

  /* Dashed rather than merely faded: the border style survives forced-colors
     mode, where opacity does not. */
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

  /* ---------------------------------------------------------------- *
   * Walk-time row
   * ---------------------------------------------------------------- */

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

  /* Stepper shell. The mockup specified −/value/+ only; the value stays a real
     text input so a 12-minute walk is one keystroke rather than twelve taps. */
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
    /* Native spinners duplicate the −/+ buttons and shrink the hit area. */
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

  /* ---------------------------------------------------------------- *
   * Colour override row
   * ---------------------------------------------------------------- */

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

  /* The real input is transparent and covers the field, so its own focus ring
     is invisible — lift the ring onto the field (WCAG 2.4.7). */
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

  /* ---------------------------------------------------------------- *
   * Stop block, empty state, add button
   * ---------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------- *
   * Station header strip — direct manipulation.
   *
   * The bar mocks a physical black sign, so its surfaces are literal
   * colours rather than theme tokens: themed chrome here would stop the
   * widget looking like the thing it edits.
   * ---------------------------------------------------------------- */

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

  /* Right zone right-aligns its tokens so the preview matches how the card
     lays the two sides out against the centre of the strip. */
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

  /* ---------------------------------------------------------------- *
   * Segmented control — used by the side switch. Enum config fields use
   * ha-form's select instead; this exists for editor-local UI state that
   * never reaches the config.
   * ---------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------- *
   * Slot panel — the four fields for whichever side is selected.
   * ---------------------------------------------------------------- */

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
`,Vt=o`
  :host {
    --wl-sunken: color-mix(in srgb, var(--primary-text-color) 3%, var(--card-background-color));
    --wl-hover: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
    --wl-ripple: color-mix(in srgb, var(--primary-color) 14%, transparent);
    /* The signage bar is a mock of a physical black sign, not themed chrome —
       these stay literal on purpose. Changing them to theme tokens would make
       the widget stop looking like the thing it is editing. */
    --wl-signage-housing: #0d0d0d;
    --wl-signage-selected: #171717;
    --wl-signage-outline: #3a3a3a;
    --wl-signage-chip: #2a2a2a;
    --wl-signage-ink: #f2f2f2;
  }
`;function Gt(e,t,i){return W`
    <div class="wl-tabs" role="tablist">
      ${e.map((r,n)=>W`<button
          type="button"
          class="wl-tab"
          role="tab"
          id=${`wl-tab-${r.key}`}
          aria-selected=${t===r.key?"true":"false"}
          aria-controls=${`wl-panel-${r.key}`}
          tabindex=${t===r.key?"0":"-1"}
          @click=${()=>i(r.key)}
          @keydown=${t=>((t,r)=>{const n="ArrowRight"===t.key?1:"ArrowLeft"===t.key?-1:0;if(!n)return;t.preventDefault();const a=e[(r+n+e.length)%e.length];a&&i(a.key)})(t,n)}
        >
          ${r.label}
          <span class="wl-tab-underline" aria-hidden="true"></span>
        </button>`)}
    </div>
  `}function Kt(e,t){return W`
    <section class="wl-section">
      <header class="wl-section-header">
        <span class="wl-section-title">${e.title}</span>
        ${e.hint?W`<span class="wl-section-hint">${e.hint}</span>`:I}
      </header>
      <div class="wl-section-body">${t}</div>
    </section>
  `}function Qt(e){return Kt(e,W`<ha-form
      .hass=${e.hass}
      .data=${e.data}
      .schema=${e.schema}
      .computeLabel=${e.computeLabel}
      .computeHelper=${e.computeHelper}
      @value-changed=${t=>{t.stopPropagation(),e.onChange(t.detail.value)}}
    ></ha-form>`)}const Zt={},Yt=me(class extends we{constructor(e){if(super(e),e.type!==ge&&e.type!==fe&&e.type!==_e)throw Error("The `live` directive is not allowed on child or event bindings");if(!(e=>void 0===e.strings)(e))throw Error("`live` bindings can only contain a single expression")}render(e){return e}update(e,[t]){if(t===F||t===I)return t;const i=e.element,r=e.name;if(e.type===ge){if(t===i[r])return F}else if(e.type===_e){if(!!t===i.hasAttribute(r))return F}else if(e.type===fe&&i.getAttribute(r)===t+"")return F;return((e,t=Zt)=>{e._$AH=t})(e),t}});function Jt(e){e.stopPropagation()}const Xt=120;function ei(e,t,i){const r=new Set;for(const n of e)n.direction===t&&(i&&n.line!==i||n.towards&&r.add(n.towards));return[...r].sort()}function ti(e,t){const i=new Set;for(const r of e)t&&r.line!==t||"H"!==r.direction&&"R"!==r.direction||i.add(r.direction);return i}function ii(e,t){return t.size>0?e.filter(e=>t.has(e)):e}function ri(e,t,i,r){const n=function(e,t){return e?.states?.[t]?.attributes}(e,t.entity),a=!n,o=n?.stop_name||t.entity,s=n?.line_colors??{},l=e=>ft(e,i.lineColorOverrides,s,"#5b6470"),d=vt(n),c=new Set(t.lines??[]),h=function(e){const t=[],i=new Set;for(const r of e?.departures??[]){const e=String(r.direction??""),n=`${r.line}|${e}|${r.towards}`;i.has(n)||(i.add(n),t.push({line:r.line,direction:e,towards:r.towards,type:r.type}))}return t.sort((e,t)=>e.line===t.line?e.towards.localeCompare(t.towards):e.line.localeCompare(t.line)),t}(n),p=new Map;for(const e of n?.departures??[])e.line&&e.type&&!p.has(e.line)&&p.set(e.line,e.type);const u=e=>({full:i.t("H"===e?"dir_h":"dir_r"),short:i.t("H"===e?"dir_h_short":"dir_r_short")});return W`
    <section class="wl-section">
      <header class="wl-section-header">
        ${i.total>1?W`<span class="wl-index" aria-hidden="true">${i.index}</span>`:I}
        <span class="wl-section-title">${o}</span>
      </header>
      <div class="wl-stop-body">
        ${a?function(e,t,i){return W`
    <ha-alert alert-type="error">
      ${t.t("entity_missing").replace("{entity}",e.entity)}
      ${i.remove?W`<button
            type="button"
            slot="action"
            class="wl-add"
            @click=${()=>i.remove?.(e.entity)}
          >
            ${t.et("remove_stop")}
          </button>`:I}
    </ha-alert>
  `}(t,i,r):I}
        ${function(e,t,i,r){const{lines:n,picked:a,colorOf:o,typeByLine:s}=r,l=a.size?t.et("lines_selected").replace("{n}",String(a.size)).replace("{total}",String(n.length)):t.et("lines_empty_means_all");return W`
    <div class="wl-group">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${t.et("lines_label")}</span>
        ${n.length?W`<span class="wl-note">${l}</span>`:I}
      </div>
      ${n.length?W`<div class="wl-chips">
            ${n.map(r=>{const n=t.singleLine?a.has(r):0===a.size||a.has(r),l=Ve(s.get(r));return W`<button
                type="button"
                class="wl-chip"
                style=${xe({"--wl-chip-color":o(r)})}
                aria-pressed=${n?"true":"false"}
                aria-label=${t.et(n?"line_active_aria":"line_inactive_aria").replace("{line}",r)}
                @click=${()=>i.toggleLine(e.entity,r)}
              >
                ${l?W`<span class="wl-chip-mode"
                      ><ha-icon icon=${l} aria-hidden="true"></ha-icon
                    ></span>`:I}
                ${r}
              </button>`})}
          </div>`:W`<div class="wl-empty">
            <span class="wl-empty-title">${t.et("no_lines_title")}</span>
            <span class="wl-note">${t.et("no_lines_hint")}</span>
          </div>`}
    </div>
  `}(t,i,r,{lines:d,picked:c,colorOf:l,typeByLine:p})}
        ${!a&&d.length?function(e,t){return!e.singleLine&&ii(t.lines,t.picked).length>=2}(i,{lines:d,picked:c})?function(e,t,i,r){const{triplets:n,picked:a,lines:o,colorOf:s,dirStrings:l}=r,d=ii(o,a),c=e.line_directions??{},h=e.direction??null,p=e=>c[e]??h,u=(t,r)=>{const n={};for(const e of d){const i=e===t?r:p(e);i&&(n[e]=i)}for(const[e,t]of Object.entries(c))d.includes(e)||(n[e]=t);i.setDirections(e.entity,{direction:null,lineDirections:n})};return W`
    <div class="wl-group">
      <span class="wl-label">${t.et("direction_label")}</span>
      ${d.map(e=>{const i=ti(n,e),r=p(e),a=i.has("H"),o=i.has("R"),d=1===i.size,c=i=>t.et("per_line_direction_aria").replace("{line}",e).replace("{direction}",null===i?t.t("dir_both"):bt(ei(n,i,e),l(i)));return W`
          <div class="wl-override-row">
            <span class="wl-badge" style=${xe({background:s(e)})}
              >${e}</span
            >
            <div class="wl-dirs">
              ${ni({label:l("H").short,active:"H"===r||null===r&&d&&a,disabled:!a,compact:!0,title:ei(n,"H",e).join(" / ")||t.t("dir_h"),ariaLabel:c("H"),onClick:()=>u(e,"H")})}
              ${ni({label:l("R").short,active:"R"===r||null===r&&d&&o,disabled:!o,compact:!0,title:ei(n,"R",e).join(" / ")||t.t("dir_r"),ariaLabel:c("R"),onClick:()=>u(e,"R")})}
              ${ni({label:"",icon:"mdi:swap-horizontal",active:null===r&&!d,disabled:d,compact:!0,title:t.t("dir_both"),ariaLabel:c(null),onClick:()=>u(e,null)})}
            </div>
          </div>
        `})}
    </div>
  `}(t,i,r,{triplets:h,picked:c,lines:d,colorOf:l,dirStrings:u}):function(e,t,i,r){const{triplets:n,picked:a,lines:o,dirStrings:s}=r,l=ii(o,a),d=1===l.length?l[0]:void 0,c=e.direction??null,h=ti(n,d),p=h.has("H"),u=h.has("R"),f=1===h.size,g="H"===c||null===c&&f&&p,_="R"===c||null===c&&f&&u,m=null===c&&!f,w=t=>{const r={};for(const[t,i]of Object.entries(e.line_directions??{}))l.includes(t)||(r[t]=i);i.setDirections(e.entity,{direction:t,lineDirections:r})},b=e=>0===h.size||h.has(e)?bt(ei(n,e,d),s(e)):`${s(e).short}: ${t.et("direction_not_served")}`,v=!u&&l.length?t.et("direction_note_one_way").replace("{line}",l[0]??""):"";return W`
    <div class="wl-group">
      <span class="wl-label">${t.et("direction_label")}</span>
      <div class="wl-dirs">
        ${ni({label:b("H"),active:g,disabled:!p,title:p?t.t("dir_h"):t.et("direction_unavailable"),onClick:()=>w("H")})}
        ${ni({label:b("R"),active:_,disabled:!u,title:u?t.t("dir_r"):t.et("direction_unavailable"),onClick:()=>w("R")})}
        ${t.singleLine?I:ni({label:t.t("dir_both"),active:m,disabled:f,title:f?t.et("direction_unavailable"):t.t("dir_both"),onClick:()=>w(null)})}
      </div>
      ${v?W`<span class="wl-note">${v}</span>`:I}
    </div>
  `}(t,i,r,{triplets:h,picked:c,lines:d,dirStrings:u}):I}
        ${a?I:function(e,t,i,r){const{attrs:n,picked:a,colorOf:o}=r,s=e.line_directions??{},l=e.direction??null,d=function(e){const t=new Map;for(const i of e?.departures??[]){const e=String(i.direction??""),r=wt(i.line,e);let n=t.get(r);n||(n={line:i.line,direction:e,type:i.type,termini:[]},t.set(r,n)),i.towards&&!n.termini.includes(i.towards)&&n.termini.push(i.towards)}const i=Array.from(t.values());return i.sort((e,t)=>e.line===t.line?e.direction.localeCompare(t.direction):e.line.localeCompare(t.line)),i}(n).filter(e=>{if(a.size>0&&!a.has(e.line))return!1;const t=s[e.line]??l;return!t||e.direction===t});return d.length?W`
    <div class="wl-group wl-divide">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${t.et("section_walk_time")}</span>
        <span class="wl-note">${t.et("walk_time_unit")}</span>
      </div>
      <span class="wl-note">${t.et("walk_time_hint")}</span>
      <div class="wl-walk-list">
        ${d.map(r=>{const n=wt(r.line,r.direction),a=e.walk_times?.[n],s=r.termini.join(" / "),l=t.et("walk_time_aria").replace("{line}",r.line).replace("{towards}",s),d=t=>{const r=(a??0)+t;i.setWalkTime(e.entity,n,r<1?null:Math.min(Xt,r))};return W`
            <div class="wl-walk-row">
              <span class="wl-badge" style=${xe({background:o(r.line)})}
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
                  @click=${()=>d(-1)}
                >
                  <ha-icon icon="mdi:minus" aria-hidden="true"></ha-icon>
                </button>
                <input
                  type="number"
                  class="wl-step-value"
                  min=${1}
                  max=${Xt}
                  step="1"
                  inputmode="numeric"
                  placeholder=${t.et("walk_time_placeholder")}
                  aria-label=${l}
                  .value=${Yt(void 0!==a?String(a):"")}
                  @keydown=${Jt}
                  @keyup=${Jt}
                  @keypress=${Jt}
                  @change=${t=>i.setWalkTime(e.entity,n,function(e,t){const i=e.trim(),r=""===i?NaN:Number(i);return""===i||Number.isFinite(r)||console.warn(`[wiener-linien-austria] walk-time "${e}" for ${t} is not a number — clearing`),Number.isFinite(r)&&r>0?Math.min(120,Math.round(r)):null}(t.target.value,`${e.entity}/${n}`))}
                />
                <button
                  type="button"
                  class="wl-step-btn"
                  ?disabled=${(a??0)>=Xt}
                  aria-label=${t.et("walk_time_more_aria").replace("{line}",r.line)}
                  @click=${()=>d(1)}
                >
                  <ha-icon icon="mdi:plus" aria-hidden="true"></ha-icon>
                </button>
              </span>
            </div>
          `})}
      </div>
    </div>
  `:I}
// Lovelace editor for the Wiener Linien Austria modern card (v2 editor system).
(t,i,r,{attrs:n,picked:c,colorOf:l})}
      </div>
    </section>
  `}function ni(e){return W`<button
    type="button"
    class=${be({"wl-dir":!0,"wl-dir--compact":!!e.compact})}
    aria-pressed=${e.active?"true":"false"}
    aria-disabled=${e.disabled?"true":"false"}
    aria-label=${e.ariaLabel??e.label}
    title=${e.title}
    @click=${t=>{e.disabled?t.preventDefault():e.onClick()}}
  >
    ${e.icon?W`<ha-icon icon=${e.icon} aria-hidden="true"></ha-icon>`:e.label}
  </button>`}let ai=class extends se{constructor(){super(...arguments),this._tab="stops",this._onEntitiesChanged=e=>{if(e.stopPropagation(),!this._config)return;const t=e.detail.value.entities,i=Array.isArray(t)?t.filter(e=>"string"==typeof e&&e.length>0):[],r=new Map(this._config.entities.map(e=>[e.entity,e]));this._commit(pt({...this._config,entities:i.map(e=>r.get(e)??{entity:e})}))},this._computeLabel=e=>{const t=this.hass?.localize?.(`ui.panel.lovelace.editor.card.generic.${e.name}`);return t||this._i18n.et(e.name)},this._computeHelper=e=>{const{et:t}=this._i18n,i=this._config;if("accessibility_only"===e.name&&!i?.show_accessibility)return t("accessibility_only_requires");if("show_delay_colors"===e.name&&!i?.show_delay)return t("show_delay_colors_requires");if("layout"===e.name&&(i?.entities.length??0)<2)return t("layout_requires");const r=`${e.name}_helper`,n=t(r);return n===r?void 0:n}}setConfig(e){this._config=pt(e)}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_tab"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._config.entities.map(e=>e.entity);return i.some(e=>t.states[e]!==this.hass.states[e])}get _i18n(){return function(e,t){const i={hassLanguage:t};return{t:t=>je(`${e}.${t}`,i),et:t=>{const r=`${e}.editor.${t}`,n=je(r,i);if(n!==r)return n;const a=`common.editor.${t}`,o=je(a,i);return o===a?t:o}}}("modern",this.hass?.language)}_commit(e){var t,i;this._config=e,t="config-changed",i={config:e},this.dispatchEvent(new CustomEvent(t,{detail:i,bubbles:!0,composed:!0}))}_patch(e){this._config&&this._commit(pt({...this._config,...e}))}_updateStop(e,t){if(!this._config)return;const i=this._config.entities.map(i=>i.entity===e?t({...i}):i);this._commit({...this._config,entities:i})}get _stopCallbacks(){return{toggleLine:(e,t)=>this._updateStop(e,e=>{const i=new Set(e.lines??[]);return i.has(t)?i.delete(t):i.add(t),i.size?e.lines=[...i]:delete e.lines,e}),setDirections:(e,t)=>this._updateStop(e,e=>(null===t.direction?delete e.direction:e.direction=t.direction,Object.keys(t.lineDirections).length?e.line_directions=t.lineDirections:delete e.line_directions,e)),setWalkTime:(e,t,i)=>this._updateStop(e,e=>{const r={...e.walk_times??{}};return null===i?delete r[t]:r[t]=i,Object.keys(r).length?e.walk_times=r:delete e.walk_times,e}),remove:e=>{this._config&&this._commit({...this._config,entities:this._config.entities.filter(t=>t.entity!==e)})}}}render(){if(!this._config)return I;const{et:e}=this._i18n;return W`
      <div class="wl-editor">
        ${Gt([{key:"stops",label:e("tab_stops")},{key:"display",label:e("tab_display")},{key:"tweaks",label:e("tab_tweaks")}],this._tab,e=>{this._tab=e})}
        ${t=this._tab,i=this._renderActiveTab(),W`
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
    `;var t,i}_renderActiveTab(){switch(this._tab){case"stops":return this._renderStops();case"display":return this._renderDisplay();case"tweaks":return this._renderMisc()}}_renderStops(){const e=this._config,{t:t,et:i}=this._i18n;return W`
      <ha-form
        .hass=${this.hass}
        .data=${{entities:e.entities.map(e=>e.entity)}}
        .schema=${[{name:"entities",required:!0,selector:{entity:{multiple:!0,filter:{domain:"sensor",integration:"wiener_linien_austria"}}}}]}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._onEntitiesChanged}
      ></ha-form>
      ${e.entities.map((r,n)=>ri(this.hass,r,{index:n+1,total:e.entities.length,lineColorOverrides:e.line_colors,t:t,et:i},this._stopCallbacks))}
    `}_renderDisplay(){const e=this._config,{et:t}=this._i18n,i={hass:this.hass,computeLabel:this._computeLabel,computeHelper:this._computeHelper,onChange:e=>this._patch(e)};return W`
      ${Qt({...i,title:t("section_layout"),hint:t("section_layout_hint"),data:{layout:e.layout,max_departures:e.max_departures,hide_header:e.hide_header,show_hero_metric:e.show_hero_metric,show_departures:e.show_departures,show_stops_ahead:e.show_stops_ahead,show_qr_button:e.show_qr_button},schema:[{name:"layout",disabled:e.entities.length<2,selector:{select:{mode:"dropdown",options:[{value:"stacked",label:t("layout_stacked")},{value:"tabs",label:t("layout_tabs")}]}}},{name:"max_departures",selector:{number:{min:0,max:20,step:1,mode:"slider"}}},{name:"hide_header",selector:{boolean:{}}},{name:"show_hero_metric",selector:{boolean:{}}},{name:"show_departures",selector:{boolean:{}}},{name:"show_stops_ahead",selector:{boolean:{}}},{name:"show_qr_button",selector:{boolean:{}}}]})}
      ${Qt({...i,title:t("section_departure_row"),hint:t("section_departure_row_hint"),data:{show_platform:e.show_platform,show_accessibility:e.show_accessibility,accessibility_only:e.accessibility_only,show_cooling:e.show_cooling,show_type_icon:e.show_type_icon},schema:[{name:"show_platform",selector:{boolean:{}}},{name:"show_accessibility",selector:{boolean:{}}},{name:"accessibility_only",disabled:!e.show_accessibility,selector:{boolean:{}}},{name:"show_cooling",selector:{boolean:{}}},{name:"show_type_icon",selector:{boolean:{}}}]})}
      ${Qt({...i,title:t("section_disruptions"),data:{show_traffic_info:e.show_traffic_info,show_elevator_info:e.show_elevator_info,show_delay:e.show_delay,show_delay_colors:e.show_delay_colors},schema:[{name:"show_traffic_info",selector:{boolean:{}}},{name:"show_elevator_info",selector:{boolean:{}}},{name:"show_delay",selector:{boolean:{}}},{name:"show_delay_colors",disabled:!e.show_delay,selector:{boolean:{}}}]})}
    `}_renderMisc(){const e=this._config,{et:t}=this._i18n;return W`
      ${this._renderColors()}
      ${Qt({hass:this.hass,title:t("section_footer"),data:{hide_attribution:e.hide_attribution},schema:[{name:"hide_attribution",selector:{boolean:{}}}],computeLabel:this._computeLabel,computeHelper:this._computeHelper,onChange:e=>this._patch(e)})}
    `}_renderColors(){const e=this._config,{et:t}=this._i18n,i=e.entities.map(e=>e.entity),r=function(e,t){const i=new Set;for(const r of t){const t=e?.states?.[r]?.attributes;for(const e of vt(t))i.add(e)}return Array.from(i).sort()}(this.hass,i),n=mt(this.hass,i);return Kt({title:t("section_colors"),hint:t("section_colors_hint")},r.length?W`<div class="wl-group">
            <span class="wl-note">${t("colors_hint")}</span>
            ${r.map(i=>{const r=ft(i,e.line_colors,n,"#888888"),a=r.startsWith("#")?r:"#888888",o=Boolean(e.line_colors[i.toUpperCase()]),s=t("pick_color_for_line").replace("{line}",i);return W`
                <div class="wl-color-row">
                  <span
                    class="wl-badge"
                    style=${xe({background:r})}
                    aria-hidden="true"
                    >${i}</span
                  >
                  <label class="wl-color-field" title=${s}>
                    <span
                      class="wl-swatch"
                      style=${xe({background:a})}
                      aria-hidden="true"
                    ></span>
                    <span class="wl-color-hex">${a.toUpperCase()}</span>
                    <input
                      type="color"
                      class="wl-color-input"
                      .value=${a}
                      aria-label=${s}
                      @input=${e=>this._setLineColor(i,e.target.value)}
                      @change=${e=>this._setLineColor(i,e.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    class="wl-icon-btn"
                    ?disabled=${!o}
                    aria-label=${t("reset_color_aria").replace("{line}",i)}
                    title=${t("reset_color")}
                    @click=${()=>this._resetLineColor(i)}
                  >
                    <ha-icon icon="mdi:restore" aria-hidden="true"></ha-icon>
                  </button>
                </div>
              `})}
          </div>`:W`<div class="wl-empty">
            <span class="wl-empty-title">${t("no_lines_title")}</span>
            <span class="wl-note">${t("colors_empty_hint")}</span>
          </div>`)}_setLineColor(e,t){this._config&&this._commit({...this._config,line_colors:{...this._config.line_colors,[e.toUpperCase()]:t}})}_resetLineColor(e){if(!this._config)return;const t={...this._config.line_colors};delete t[e.toUpperCase()],this._commit({...this._config,line_colors:t})}static{this.styles=[Vt,It]}};var oi;e([pe({attribute:!1})],ai.prototype,"hass",void 0),e([ue()],ai.prototype,"_config",void 0),e([ue()],ai.prototype,"_tab",void 0),ai=e([de("wiener-linien-austria-card-editor")],ai);{const e=window;e.customCards=e.customCards??[],e.customCards.some(e=>"wiener-linien-austria-card"===e.type)||e.customCards.push({type:"wiener-linien-austria-card",name:"Wiener Linien Austria",description:"Abfahrtsmonitor mit Störungen und Aufzugsinfo",preview:!0,getEntitySuggestion:(e,t)=>t.startsWith("sensor.")?"wiener_linien_austria"!==e?.entities?.[t]?.platform?null:{config:{type:"custom:wiener-linien-austria-card",entities:[t]}}:null})}function si(e){return e===Ie?"platform_short_rail":"platform_short_bus"}const li=new Map;let di=class extends se{constructor(){super(...arguments),this._activeTab=0,this._versionMismatch=null,this._expandedTraffic=new Set,this._expandedElevator=new Set,this._expandedRows=new Set,this._expandedTransfers=new Set,this._debugTraffic=[],this._debugElevator=[],this._qrOpenFor=null,this._devPaletteOpen=!1,this._versionCheckDone=!1,this._fallbackWarned=!1,this._resolvedStopsMemo=null,this._nightlineHourMemo=null,this._devTogglePalette=()=>{this._devPaletteOpen=!this._devPaletteOpen},this._devTrafficVariant=0,this._devElevatorVariant=0,this._devTestTraffic=()=>{const e=this._resolveStops(),t=[];for(const i of e)for(const e of this._attrs(i.entity).departures??[])e.line&&e.towards&&t.push(e);const i=this._randomFrom(t),r=i?.line||"U?",n=i?.towards||"Unbekannt",a=new Date,o=oi.DEV_TRAFFIC_SHAPES,s=o[this._devTrafficVariant%o.length];this._devTrafficVariant+=1;const l=s.html(r,n);this._debugTraffic=[...this._debugTraffic,{name:`DEBUG-T-${Date.now()}`,title:`${r}: ${s.label}`,description:l.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim(),description_html:l,location:"Debug-Stelle",related_lines:[r],time_start:new Date(a.getTime()-18e5).toISOString(),time_end:new Date(a.getTime()+108e5).toISOString(),time_created:new Date(a.getTime()-18e5).toISOString(),time_last_update:a.toISOString(),status:"active"}]},this._devTestElevator=()=>{const e=this._resolveStops(),t=this._randomFrom(e);if(!t)return;const i=this._attrs(t.entity),r=i.stop_name||t.entity,n=i.departures??[],a=this._randomFrom(n),o=a?.line||"",s=a?.towards||"Unbekannt",l=new Date,d=[{description:`${o||"U3"} Mittelbahnsteig - Zwischengeschoss Zugang ${r} - Ausgang ${r}`,reason:"Aufzug ist wegen Bauarbeiten bis 03.08.2026 außer Betrieb!"},{description:`${o||"U6"} Bahnsteig Richtung ${s} - Ausgang ${r}`,reason:"An der Instandsetzung wird bereits gearbeitet."},{description:`Ausgang ${r}`,reason:"Der Aufzug steht aus nicht näher bekannter Ursache still."}],c=d[this._devElevatorVariant%d.length];this._devElevatorVariant+=1,this._debugElevator=[...this._debugElevator,{__debug_entity:t.entity,name:`DEBUG-E-${Date.now()}`,station:r,description:c.description,reason:c.reason,status:"außer Betrieb",related_lines:o?[o]:[],time_start:new Date(l.getTime()-27e5).toISOString(),time_end:new Date(l.getTime()+144e5).toISOString()}]},this._devClear=()=>{this._debugTraffic=[],this._debugElevator=[],this._devPaletteOpen=!1}}static{oi=this}setConfig(e){if(!e||"object"!=typeof e)throw new Error("wiener-linien-austria-card: config must be an object");const t=Array.isArray(e.entities),i="string"==typeof e.entity;if(!t&&!i)throw new Error("wiener-linien-austria-card: 'entities' (array) or legacy 'entity' (string) is required");const r=pt(e);if((Array.isArray(e.entities)?e.entities.length:i?1:0)>0&&0===r.entities.length)throw new Error("wiener-linien-austria-card: every configured entity was rejected (must start with `sensor.`) — see browser console for per-entry details");this._config=r,this._expandedRows=new Set,this._expandedTraffic=new Set,this._expandedElevator=new Set,this._expandedTransfers=new Set,this._qrOpenFor=null,this._activeTab=0,this._fallbackWarned=!1,this._debugTraffic=[],this._debugElevator=[]}getCardSize(){const e=this._config?.entities.length??1;return Math.min(12,3+3*e)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:3}}static getConfigElement(){return document.createElement("wiener-linien-austria-card-editor")}static getStubConfig(e){const t=gt(e)[0];return{entities:t?[t]:[],max_departures:6}}connectedCallback(){super.connectedCallback(),function(){if("undefined"==typeof document)return;if(document.getElementById(ze))return;const e=document.createElement("style");e.id=ze,e.textContent='\n@font-face {\n  font-family: "WL Sans";\n  src: url("/wiener-linien-austria/fonts/wl-sans-regular.woff2") format("woff2");\n  font-weight: 400;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Sans";\n  src: url("/wiener-linien-austria/fonts/wl-sans-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Sans Condensed";\n  src: url("/wiener-linien-austria/fonts/wl-sans-condensed-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Mono";\n  src: url("/wiener-linien-austria/fonts/wl-mono-regular.woff2") format("woff2");\n  font-weight: 400;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Mono";\n  src: url("/wiener-linien-austria/fonts/wl-mono-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n',document.head.appendChild(e)}(),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion())}willUpdate(e){if(this._resolvedStopsMemo=null,this._nightlineHourMemo=null,this._config&&(e.has("_config")||e.has("hass"))){const e=this._resolveStops();if(e.length&&this._activeTab>=e.length&&(this._activeTab=0),this._qrOpenFor){const t=new Set(e.map(e=>e.entity));t.has(this._qrOpenFor)||(this._qrOpenFor=null)}}}updated(e){if(!e.has("_qrOpenFor")&&!e.has("hass")&&!e.has("_config"))return;if(!this._qrOpenFor)return;const t=this.renderRoot.querySelector(".qr-panel.expanded .qr-canvas");if(!t)return;const i=t.getAttribute("data-qr-text")??"",r=t.getAttribute("data-qr-rendered-for")??"";i&&i!==r&&(this._renderTintedQr(t),t.setAttribute("data-qr-rendered-for",i))}_renderTintedQr(e){const t=e.closest(".station"),i=t&&getComputedStyle(t).getPropertyValue("--wl-accent").trim()||"#000";for(;e.firstChild;)e.removeChild(e.firstChild);Se.render({text:e.getAttribute("data-qr-text")??"",radius:0,ecLevel:"H",fill:i,background:"#fff",size:220},e);const r=e.querySelector("canvas");if(!(r instanceof HTMLCanvasElement))return void console.error("[wiener-linien-austria-card] QR canvas unavailable");const n=r.getContext("2d");if(!n)return void console.error("[wiener-linien-austria-card] QR canvas unavailable");const a=e.getAttribute("data-qr-icon")??"mdi:bus-stop",o=this._mdiPathFor(a);if(!o)return;const s=r.width,l=r.height,d=Math.round(.22*s),c=Math.round((s-d)/2),h=Math.round((l-d)/2),p=Math.round(.18*d),u=c-p,f=h-p,g=d+2*p,_=Math.round(.2*d);n.fillStyle="#fff","function"==typeof n.roundRect?(n.beginPath(),n.roundRect(u,f,g,g,_),n.fill()):n.fillRect(u,f,g,g),n.save(),n.translate(c,h),n.scale(d/24,d/24),n.fillStyle=i,n.fill(new Path2D(o)),n.restore()}_mdiPathFor(e){switch(e){case"mdi:subway-variant":return"M18,11H13V6H18M16.5,17A1.5,1.5 0 0,1 15,15.5A1.5,1.5 0 0,1 16.5,14A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 16.5,17M11,11H6V6H11M7.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,14A1.5,1.5 0 0,1 9,15.5A1.5,1.5 0 0,1 7.5,17M12,2C7.58,2 4,2.5 4,6V15.5A3.5,3.5 0 0,0 7.5,19L6,20.5V21H18V20.5L16.5,19A3.5,3.5 0 0,0 20,15.5V6C20,2.5 16.42,2 12,2Z";case"mdi:tram":return"M19,16.94V8.5C19,5.71 16.39,5.1 13,5L13.75,3.5H17V2H7V3.5H11.75L11,5C7.86,5.11 5,5.73 5,8.5V16.94C5,18.39 6.19,19.6 7.59,19.91L6,21.5V22H8.23L10.23,20H14L16,22H18V21.5L16.5,20H16.42C18.11,20 19,18.63 19,16.94M12,18.5A1.5,1.5 0 0,1 10.5,17A1.5,1.5 0 0,1 12,15.5A1.5,1.5 0 0,1 13.5,17A1.5,1.5 0 0,1 12,18.5M17,14H7V9H17V14Z";case"mdi:bus":return"M18,11H6V6H18M16.5,17A1.5,1.5 0 0,1 15,15.5A1.5,1.5 0 0,1 16.5,14A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 16.5,17M7.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,14A1.5,1.5 0 0,1 9,15.5A1.5,1.5 0 0,1 7.5,17M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16Z";default:return"M22 7V16C22 16.71 21.62 17.36 21 17.72V19.25C21 19.66 20.66 20 20.25 20H19.75C19.34 20 19 19.66 19 19.25V18H12V19.25C12 19.66 11.66 20 11.25 20H10.75C10.34 20 10 19.66 10 19.25V17.72C9.39 17.36 9 16.71 9 16V7C9 4 12 4 15.5 4S22 4 22 7M13 15C13 14.45 12.55 14 12 14S11 14.45 11 15 11.45 16 12 16 13 15.55 13 15M20 15C20 14.45 19.55 14 19 14S18 14.45 18 15 18.45 16 19 16 20 15.55 20 15M20 7H11V11H20V7M7 9.5C6.97 8.12 5.83 7 4.45 7.05C3.07 7.08 1.97 8.22 2 9.6C2.03 10.77 2.86 11.77 4 12V20H5V12C6.18 11.76 7 10.71 7 9.5Z"}}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_activeTab")||e.has("_versionMismatch")||e.has("_expandedTraffic")||e.has("_expandedElevator")||e.has("_expandedRows")||e.has("_expandedTransfers")||e.has("_qrOpenFor")||e.has("_debugTraffic")||e.has("_debugElevator"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._resolveStops().map(e=>e.entity);return i.some(e=>t.states[e]!==this.hass.states[e])}_lang(){return this.hass?.language?.startsWith("de")?"de":"en"}_t(e,t){return je(`modern.${e}`,{hassLanguage:this.hass?.language},t)}async _checkCardVersion(){try{this._versionMismatch=await async function(e,t,i){if(!e?.callWS)return null;try{const r=await e.callWS({type:t});if(r?.version&&r.version!==i)return r.version}catch{}return null}(this.hass,"wiener_linien_austria/card_version","2.0.0")}catch(e){console.warn("[wiener-linien-austria-card] version probe failed",e)}}_resolveStops(){if(null!==this._resolvedStopsMemo)return this._resolvedStopsMemo;const e=this._computeResolvedStops();return this._resolvedStopsMemo=e,e}_computeResolvedStops(){const e=(this._config?.entities??[]).filter(e=>this.hass?.states?.[e.entity]);if(e.length)return e;const t=gt(this.hass)[0];if(t){if(!this._fallbackWarned&&(this._config?.entities?.length??0)>0){this._fallbackWarned=!0;const e=this._config?.entities.map(e=>e.entity).join(", ");console.warn(`[wiener-linien-austria-card] configured entity "${e}" not in hass.states; falling back to "${t}"`)}return[{entity:t}]}return[]}_attrs(e){return this.hass?.states?.[e]?.attributes??{}}render(){if(!this._config)return I;if(!this.hass)return W`<ha-card><div class="wrap"></div></ha-card>`;const e=this._config,t=this._resolveStops(),i="tabs"===e.layout&&t.length>=2,r=e.hide_attribution?"":t.map(e=>this._attrs(e.entity).attribution).find(e=>"string"==typeof e&&e.length>0)||"Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0";return W`
      <ha-card>
        ${i?this._renderTabs(t,this._activeTab):I}
        <div class="wrap">
          ${We(this._versionMismatch,e=>this._t(e))}
          ${e.show_traffic_info?this._renderTrafficBanner(t):I}
          ${this._renderBody(t,i)}
          ${this._renderFooter(r)}
        </div>
      </ha-card>
    `}_renderFooter(e){const t=this._isDevMode();return e||t?W`
      ${e?W`<div class="foot">
            <span class="timestamp">${e}</span>
          </div>`:I}
      ${t?this._renderDevModePanel():I}
    `:I}_renderBody(e,t){if(!e.length)return this._renderEmpty();if(t){const t=e[this._activeTab]??e[0];return W`${this._renderStop(t,this._activeTab)}`}return W`${e.map(e=>this._renderStop(e))}`}_renderEmpty(){const e=gt(this.hass).length?"no_entities_picked":"no_entities_available";return W`<div class="empty" role="status" aria-live="polite">${this._t(e)}</div>`}_renderTabs(e,t){return W`
      <div class="tabbar">
        <div class="tabs" role="tablist">
        ${e.map((i,r)=>{const n=this._attrs(i.entity),a=n.stop_name||n.friendly_name||i.entity,o=r===t;return W`<button
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
    `}_renderTabActions(e,t){if(!this._config.hide_header)return I;const i=e[t]??e[0];if(!i)return I;const r=this._attrs(i.entity),n=r.stop_name||r.friendly_name||i.entity,a=this._stopMapUrl(n,r.latitude,r.longitude),o=this._stopGeoUri(n,r.latitude,r.longitude),s=!1!==this._config.show_qr_button,l=s&&null!==o;return a||l?W`<div
      class=${be({"tab-actions":!0,reserved:s})}
    >
      ${this._renderStopActions(i.entity,n,a,l)}
    </div>`:I}_setActiveTab(e){if(!Number.isFinite(e))return;const t=this._resolveStops(),i=Math.max(0,Math.min(t.length-1,Math.floor(e)));if(i===this._activeTab)return;const r=t[this._activeTab]?.entity,n=t[i]?.entity;r&&n&&this._qrOpenFor===r&&(this._qrOpenFor=n),this._activeTab=i}_onTabKeydown(e,t,i){let r=t;switch(e.key){case"ArrowRight":r=(t+1)%i;break;case"ArrowLeft":r=(t-1+i)%i;break;case"Home":r=0;break;case"End":r=i-1;break;default:return}e.preventDefault(),this._setActiveTab(r),this.updateComplete.then(()=>{const e=this.shadowRoot?.querySelectorAll('.tabs [role="tab"]');e?.[r]?.focus()}).catch(e=>{console.warn("[wiener-linien-austria-card] tab focus skipped",e)})}_renderStopHeader(e,t,i,r,n,a,o){return W`<header class="head">
      <span class="icon-tile" aria-hidden="true">
        <ha-icon icon=${n}></ha-icon>
      </span>
      <div class="title-block">
        <h3 class="title">${Fe(t,e.entity)}</h3>
        ${r?.line?W`<p class="subtitle">${Fe(r.towards)}</p>`:I}
      </div>
      ${a||o?W`<div class="head-actions">
            ${this._renderStopActions(e.entity,i,a,o)}
          </div>`:I}
    </header>`}_renderStopActions(e,t,i,r){const n=this._t("open_in_maps"),a=this._t("qr_open");return W`
      ${r?W`<button
            type="button"
            class=${be({"icon-action":!0,"qr-toggle":!0,expanded:this._qrOpenFor===e})}
            title=${a}
            aria-label="${a}: ${t}"
            aria-expanded=${this._qrOpenFor===e?"true":"false"}
            aria-controls="wl-qr-${yt(e)}"
            @click=${()=>this._toggleQrFor(e)}
          ><ha-icon icon="mdi:qrcode" aria-hidden="true"></ha-icon></button>`:I}
      ${i?W`<a
            class="icon-action"
            href=${i}
            target="_blank"
            rel="noopener noreferrer"
            title=${n}
            aria-label="${n}: ${t}"
          ><ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon></a>`:I}
    `}_renderStopHero(e,t,i,r){return W`<div class="hero-host">
      <div class="hero">
        <div class="hero-time" aria-live="polite" aria-atomic="true">
          <span class="hero-min">${i}</span>
          ${r?W`<span class="hero-unit">${r}</span>`:I}
        </div>
        ${t.flatMap(t=>[this._renderHeroEntry(t,e.entity),this._renderHeroPanelForEntry(t,e.entity)])}
      </div>
    </div>`}_renderStop(e,t){const i=this._attrs(e.entity),r=i.stop_name||i.friendly_name,n=r||e.entity,a=function(e,t){const{lines:i,direction:r,line_directions:n,walk_times:a,accessibility_only:o}=t,s=i&&i.length?new Set(i):null;return e.filter(e=>{if(s&&!s.has(e.line))return!1;const t=n?.[e.line]??r;if(t&&e.direction!==t)return!1;if(a){const t=a[wt(e.line,String(e.direction??""))];if("number"==typeof t&&e.countdown<t)return!1}return!(o&&!e.barrier_free)})}(Array.isArray(i.departures)?i.departures:[],{...e,accessibility_only:this._config.accessibility_only}),o=Array.isArray(i.elevator_info)?i.elevator_info:[],s=this._debugElevator.filter(t=>t.__debug_entity===e.entity),l=[...o,...s],d=this._config.show_elevator_info&&l.length>0,c=this._stopMapUrl(n,i.latitude,i.longitude),h=this._stopGeoUri(n,i.latitude,i.longitude),p=!1!==this._config.show_qr_button&&null!==h,u=!this._config.hide_header||void 0!==t,f=this._computeHeroGroup(a),g=f[0],_=this._config.show_hero_metric?new Set(f):new Set,m=a.filter(e=>!_.has(e)),w=m.slice(0,this._config.max_departures),b="number"==typeof i.stale_departures?i.stale_departures:0,v=_t(this.hass,e.entity),y=g?ft(g.line||"",this._config.line_colors,v):"var(--primary-color)",x=($=g?.type,Ve($)??"mdi:bus-stop");var $;const k=g&&Number.isFinite(g.countdown)?g.countdown:null,S=null===k?"—":k<=0?this._t("now"):String(k),A=null!==k&&k>0?this._t("min"):"",z=Ft(y,this._colorScheme()),E=void 0!==t;return W`
      <section
        class="station"
        style="--wl-accent: ${y};${z?` --wl-accent-text: ${z};`:""}"
        id=${E?`wl-tabpanel-${t}`:I}
        role=${E?"tabpanel":I}
        aria-labelledby=${E?`wl-tab-${t}`:I}
        tabindex=${E?"0":I}
        aria-label=${n}
      >
        ${this._config.hide_header?I:this._renderStopHeader(e,r,n,g,x,c,p)}
        ${p&&h&&u?this._renderQrPanel(e.entity,n,h,x,this._qrOpenFor===e.entity):I}

        ${this._config.show_hero_metric&&g?this._renderStopHero(e,f,S,A):I}
        ${d?this._renderElevatorDetails(l):I}
        ${this._config.show_departures&&this._config.max_departures>0?w.length?W`${b>0?W`<div class="stale-note" role="status" aria-live="polite">
                      ${this._t("stale_feed_partial")}
                    </div>`:I}
                <ul class="dep-list" role="list" aria-label=${this._t("departures_list")}>
                  ${w.map((t,i)=>this._renderRow(t,e.entity,i))}
                </ul>`:this._renderEmptyState(i,b):I}
      </section>
    `}_renderEmptyState(e,t){if(t>0){const t=e.stale_since?Pt(e.stale_since,this._lang()):"";return W`<div class="empty stale" role="status" aria-live="polite">
        <div class="empty-title">${this._t("stale_feed")}</div>
        <div class="empty-detail">${this._t("stale_feed_detail")}</div>
        ${t?W`<div class="empty-meta">
              ${this._t("stale_feed_since",{time:t})}
            </div>`:I}
      </div>`}return W`<div class="empty" role="status" aria-live="polite">
      ${this._t(e.server_time?"betriebsschluss":"no_data")}
    </div>`}_renderElevatorDetails(e){return W`
      <div class="alert-list">
        ${e.map(e=>this._renderElevatorDetail(e))}
      </div>
    `}_renderElevatorDetail(e){const t=e.description||e.station||"",i=function(e){return e.split(/\s+-\s+/).map(e=>e.trim().replace(/\.$/,"")).filter(Boolean)}(t),r=e.reason||"",n=function(e){for(const[t,i]of Tt)if(t.test(e))return i;return Et}(r),a=Pt(e.time_end,this._lang()),o=Boolean(r||a),s=this._expandedElevator.has(e.name);return W`
      <div
        class=${be({alert:!0,expanded:s,"no-detail":!o})}
        role=${o?"button":"group"}
        tabindex=${o?"0":"-1"}
        aria-expanded=${o?s?"true":"false":I}
        aria-label=${t}
        @click=${()=>o&&this._toggleElevator(e.name)}
        @keydown=${t=>this._onExpanderKeydown(t,o,()=>this._toggleElevator(e.name))}
      >
        <ha-icon icon="mdi:elevator-passenger-off" aria-hidden="true"></ha-icon>
        <div class="alert-body">
          <div class="alert-summary">
            <div class="alert-title">
              <span lang="de" class="lift-path"
                >${i.map((e,t)=>W`${t?W`<span class="lift-path-sep" aria-hidden="true">›</span>`:I}<span>${e}</span>`)}</span
              >
            </div>
          </div>
          ${o?W`<div class="alert-detail">
                <div class="alert-detail-inner">
                  ${r?W`<div class="alert-desc lift-reason">
                        <ha-icon icon=${n} aria-hidden="true"></ha-icon>
                        <span lang="de">${r}</span>
                      </div>`:I}
                  ${a?W`<div class="alert-meta">
                        <span>${this._t("elevator_until")} ${a}</span>
                      </div>`:I}
                </div>
              </div>`:I}
        </div>
        ${o?W`<ha-icon class="alert-chevron" icon="mdi:chevron-down" aria-hidden="true"></ha-icon>`:I}
      </div>
    `}_toggleElevator(e){this._expandedElevator=xt(this._expandedElevator,e)}_onExpanderKeydown(e,t,i){t&&("Enter"!==e.key&&" "!==e.key||(e.preventDefault(),i()))}_renderTrafficBanner(e){const t=new Set,i=[];for(const r of e)for(const e of this._attrs(r.entity).traffic_info??[])t.has(e.name)||(t.add(e.name),i.push(e));for(const e of this._debugTraffic)t.has(e.name)||(t.add(e.name),i.push(e));if(!i.length)return I;const r=mt(this.hass,this._config.entities.map(e=>e.entity));return W`
      <div class="alert-list">
        ${i.map(e=>this._renderTrafficItem(e,r))}
      </div>
    `}_renderTrafficNotice(e){const t=e.blocks.reduce((e,t)=>"heading"===t.kind?e+1:e,0),i=t>1?e.blocks:e.blocks.filter(e=>"heading"!==e.kind);return W`
      <div class="alert-desc" lang="de">
        ${i.map(e=>"heading"===e.kind?W`<p class="alert-desc-heading">${e.text}</p>`:W`<p>${e.text}</p>`)}
        ${e.facts.length?W`<dl class="alert-facts">
              ${e.facts.map(e=>W`<div class="alert-fact">
                  <dt>
                    <ha-icon icon=${e.icon} aria-hidden="true"></ha-icon>${e.label}
                  </dt>
                  <dd>${e.value}</dd>
                </div>`)}
            </dl>`:I}
      </div>
    `}_renderTrafficItem(e,t){const i=this._config.line_colors,r=Array.isArray(e.related_lines)?e.related_lines:[],n=Ot(e.description_html||e.description||""),a=n.blocks.length>0||n.facts.length>0,o=Pt(e.time_end,this._lang()),s=Pt(e.time_last_update,this._lang()),l=Pt(e.time_created,this._lang()),d=s&&s!==l?s:"",c=Boolean(e.location||o||d),h=Boolean(a||c),p=this._expandedTraffic.has(e.name),u={alert:!0,expanded:p,"no-detail":!h},f=e.title||this._t("traffic_label");return W`
      <div
        class=${be(u)}
        role=${h?"button":"group"}
        tabindex=${h?"0":"-1"}
        aria-expanded=${h?p?"true":"false":I}
        aria-label=${f}
        @click=${()=>h&&this._toggleTraffic(e.name)}
        @keydown=${t=>this._onExpanderKeydown(t,h,()=>this._toggleTraffic(e.name))}
      >
        <ha-icon icon="mdi:alert-octagon" aria-hidden="true"></ha-icon>
        <div class="alert-body">
          <div class="alert-summary">
            ${r.length?W`<div class="alert-lines">
                  ${r.map(e=>W`<span
                      class="alert-line-badge"
                      style=${xe(ut(e,i,t))}
                    >${e}</span>`)}
                </div>`:I}
            <div class="alert-title">${e.title?Fe(e.title):this._t("traffic_label")}</div>
          </div>
          ${h?W`<div class="alert-detail">
                <div class="alert-detail-inner">
                  ${a?this._renderTrafficNotice(n):I}
                  ${c?W`<div class="alert-meta">
                        ${e.location?W`<span class="alert-location-chip">
                              <ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon>${Fe(e.location)}
                            </span>`:I}
                        ${o?W`<span>${this._t("traffic_until")} ${o}</span>`:I}
                        ${d?W`<span>${this._t("traffic_updated")} ${d}</span>`:I}
                      </div>`:I}
                </div>
              </div>`:I}
        </div>
        ${h?W`<ha-icon class="alert-chevron" icon="mdi:chevron-down" aria-hidden="true"></ha-icon>`:I}
      </div>
    `}_toggleTraffic(e){this._expandedTraffic=xt(this._expandedTraffic,e)}_computeHeroGroup(e){if(0===e.length)return[];const t=e=>Number.isFinite(e.countdown)?e.countdown:Number.POSITIVE_INFINITY,i=Math.min(...e.map(t));return Number.isFinite(i)?i<=0?e.filter(e=>t(e)<=0):e.filter(e=>t(e)===i):[e[0]]}_expandState(e,t,i){const r=function(e,t){return!1!==e&&Array.isArray(t.stops_ahead)&&t.stops_ahead.length>0}(this._config.show_stops_ahead,e),n=this._rowKey(e,t),a=r&&this._expandedRows.has(n),o=a?"stops_ahead_aria_hide":"stops_ahead_aria_show";return{hasStopsAhead:r,rowKey:n,expanded:a,panelId:this._panelId(e,t,i),ariaLabel:r?this._t(o,{line:e.line||"?",towards:e.towards||""}):""}}_renderStopsAheadInner(e,t,i,r){const n=this._config.line_colors,a=_t(this.hass,r);return W`
      <ol
        class="stops-ahead"
        style=${xe({"--stops-ahead-line":ft(t,n,a)})}
      >
        ${e.map((e,t)=>this._renderStopAhead(e,t,i,n,a))}
      </ol>
    `}_renderHeroEntry(e,t){const i=ut(e.line||"",this._config.line_colors,_t(this.hass,t)),r=this._config.show_platform&&e.platform?String(e.platform):null,n=!!e.barrier_free&&this._config.show_accessibility,a=!!e.cooling&&this._config.show_cooling,o=this._config.show_type_icon?Ve(e.type):null,{hasStopsAhead:s,rowKey:l,expanded:d,panelId:c,ariaLabel:h}=this._expandState(e,t,"hero"),p={"hero-entry":!0,expandable:s,expanded:d},u=e.line||"?";return W`
      <div
        class=${be(p)}
        style=${s?`--stops-ahead-line: ${i.background};`:I}
        role=${s?"button":I}
        tabindex=${s?"0":I}
        aria-expanded=${s?d?"true":"false":I}
        aria-controls=${s?c:I}
        aria-label=${s?h:I}
        @click=${()=>s&&this._toggleRow(l)}
        @keydown=${e=>this._onExpanderKeydown(e,s,()=>this._toggleRow(l))}
      >
        <span
          class="line-badge"
          style=${xe(i)}
        >${u}</span>
        ${o?W`<ha-icon
              class="type-icon"
              icon=${o}
              aria-hidden="true"
            ></ha-icon>`:I}
        <span class="hero-direction">${Fe(e.towards)}</span>
        ${r?W`<span class="hero-platform"
              >${this._t(si(e.type))} ${r}</span
            >`:I}
        ${n?W`<span
              class="hero-a11y"
              role="img"
              aria-label=${this._t("barrier_free_title")}
              title=${this._t("barrier_free_title")}
            >
              <ha-icon
                icon="mdi:wheelchair-accessibility"
                aria-hidden="true"
              ></ha-icon>
            </span>`:I}
        ${a?W`<span
              class="hero-cooling"
              role="img"
              aria-label=${this._t("cooling_title")}
              title=${this._t("cooling_title")}
            >
              <ha-icon icon="mdi:snowflake" aria-hidden="true"></ha-icon>
            </span>`:I}
        ${s?W`<ha-icon
              class="hero-chevron"
              icon="mdi:chevron-down"
              aria-hidden="true"
            ></ha-icon>`:I}
      </div>
    `}_renderHeroPanelForEntry(e,t){const{hasStopsAhead:i,rowKey:r,expanded:n,panelId:a}=this._expandState(e,t,"hero");return i?this._renderStopsAheadPanel("hero",e.stops_ahead,a,n,e.line||"?",r,t):I}_renderStopsAheadPanel(e,t,i,r,n,a,o){const s="hero"===e?"hero-detail":"dep-row-detail",l=be({[s]:!0,expanded:r}),d=r?"false":"true",c=W`
      <div class="${s}-inner">
        ${this._renderStopsAheadInner(t,n,a,o)}
      </div>
    `;return"hero"===e?W`<div
          class=${l}
          id=${i}
          role="region"
          aria-hidden=${d}
        >
          ${c}
        </div>`:W`<li class=${l} id=${i} role="region" aria-hidden=${d}>
          ${c}
        </li>`}_colorScheme(){return!0===this.hass?.themes?.darkMode?"dark":!1===this.hass?.themes?.darkMode?"light":void 0}_rowAccentText(e){const t=this._colorScheme();return void 0===t?null:Ft(e,t)??"var(--primary-text-color)"}_renderRow(e,t,i=0){const r=this._config.line_colors,n=_t(this.hass,t),a=e.line||"?",o=ut(a,r,n),s=Number.isFinite(e.countdown)?e.countdown:null,l=null===s?"—":s<=0?this._t("now"):`${s} ${this._t("min")}`,d=function(e,t){if(!e||!t)return null;const i=Date.parse(e),r=Date.parse(t);return Number.isFinite(i)&&Number.isFinite(r)?Math.round((r-i)/6e4):null}(e.time_planned,e.time_real),c=this._config.show_delay&&null!==d&&d>=1?1===d?this._t("delay_singular"):this._t("delay_plural",{n:d}):"",h=this._config.show_delay_colors;let p="";null!==s&&s<=0?p="now":h&&null!==d?d>=1?p="late":d<=-1&&(p="early"):p="";const u="now"===p?this._rowAccentText(o.background):null,f=this._config.show_accessibility,g=this._config.show_cooling,_=Boolean(e.traffic_jam||f&&e.barrier_free||g&&e.cooling),m=this._config.show_platform&&e.platform?String(e.platform):null,w=this._config.show_type_icon?Ve(e.type):null,{hasStopsAhead:b,rowKey:v,expanded:y,panelId:x,ariaLabel:$}=this._expandState(e,t,"row"),k=W`
      <li
        class=${be({"dep-row":!0,expandable:b,expanded:y})}
        style=${`--row-i: ${i};${u?` --wl-accent-text: ${u};`:""}${b?` --stops-ahead-line: ${o.background};`:""}`}
        role=${b?"button":I}
        tabindex=${b?"0":I}
        aria-expanded=${b?y?"true":"false":I}
        aria-controls=${b?x:I}
        aria-label=${b?$:I}
        @click=${()=>b&&this._toggleRow(v)}
        @keydown=${e=>this._onExpanderKeydown(e,b,()=>this._toggleRow(v))}
      >
        <div class="line-badge" style=${xe(o)}>${a}</div>
        <div class="towards">
          ${w?W`<ha-icon class="type-icon" icon=${w} aria-hidden="true"></ha-icon>`:I}
          <div class="towards-rows">
            <span class="towards-name">${Fe(e.towards)}</span>${c?W`<span class="delay">${c}</span>`:I}
          </div>
        </div>
        ${m||_?W`<span class="row-end">
              ${m?W`<span class="row-platform"
                    >${this._t(si(e.type))} ${m}</span
                  >`:I}
              ${_?W`<span class="row-flags">
                    ${e.traffic_jam?W`<ha-icon
                          class="disturbance"
                          icon="mdi:alert-circle"
                          role="img"
                          aria-label=${this._t("disturbance_title")}
                          title=${this._t("disturbance_title")}
                        ></ha-icon>`:I}
                    ${f&&e.barrier_free?W`<ha-icon
                          class="a11y"
                          icon="mdi:wheelchair-accessibility"
                          role="img"
                          aria-label=${this._t("barrier_free_title")}
                          title=${this._t("barrier_free_title")}
                        ></ha-icon>`:I}
                    ${g&&e.cooling?W`<ha-icon
                          class="cooling"
                          icon="mdi:snowflake"
                          role="img"
                          aria-label=${this._t("cooling_title")}
                          title=${this._t("cooling_title")}
                        ></ha-icon>`:I}
                  </span>`:I}
            </span>`:W`<span></span>`}
        <!-- Conditional spread avoids classMap({ "": true }) when cdState is "". -->
        <div class=${be({countdown:!0,...p?{[p]:!0}:{}})}>${l}</div>
        ${b?W`<ha-icon
              class="row-chevron"
              icon="mdi:chevron-down"
              aria-hidden="true"
            ></ha-icon>`:I}
      </li>
    `;return b?[k,this._renderStopsAheadPanel("row",e.stops_ahead,x,y,a,v,t)]:k}_renderStopAhead(e,t,i,r,n){const a=e.lines??[],o=this._isNightlineHour(),s=[],l=[];for(const e of a)/^U\d/.test(e)||o&&/^N\d/.test(e)?s.push(e):l.push(e);const d=this._transferKey(i,t),c=this._expandedTransfers.has(d),h={"stops-ahead-stop":!0,terminus:!!e.is_terminus,"transfers-expanded":c},p=s.length?W`<span class="stops-ahead-metros">
          ${s.map(e=>W`<span
              class="stops-ahead-line-chip"
              style=${xe(ut(e,r,n))}
              >${e}</span
            >`)}
        </span>`:I,u=l.length?W`<button
          type="button"
          class="stops-ahead-other-toggle"
          aria-expanded=${c?"true":"false"}
          aria-label=${this._t(c?"stops_ahead_other_hide":"stops_ahead_other_show",{count:l.length,stop:e.name})}
          @click=${e=>{e.stopPropagation(),this._toggleTransfers(d)}}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||e.stopPropagation()}}
        >
          <span class="stops-ahead-other-count">+${l.length}</span>
          <ha-icon icon="mdi:chevron-down" aria-hidden="true"></ha-icon>
        </button>`:I,f=l.length&&c?W`<div class="stops-ahead-others">
            ${l.map(e=>W`<span
                class="stops-ahead-line-chip stops-ahead-line-chip--other"
                style=${xe(ut(e,r,n))}
                >${e}</span
              >`)}
          </div>`:I,g=l.length>0,_=g?this._t(c?"stops_ahead_other_hide":"stops_ahead_other_show",{count:l.length,stop:e.name}):"";return W`
      <li class=${be(h)}>
        <div
          class="stops-ahead-row"
          role=${g?"button":I}
          tabindex=${g?"0":I}
          aria-expanded=${g?c?"true":"false":I}
          aria-label=${g?_:I}
          @click=${g?e=>{e.stopPropagation(),this._toggleTransfers(d)}:I}
          @keydown=${g?e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),e.stopPropagation(),this._toggleTransfers(d))}:I}
        >
          <span class="stops-ahead-dot" aria-hidden="true"></span>
          <span class="stops-ahead-name">${Fe(e.name)}</span>
          ${p} ${u}
        </div>
        ${f}
      </li>
    `}_toggleTransfers(e){this._expandedTransfers=xt(this._expandedTransfers,e)}_isNightlineHour(){if(null!==this._nightlineHourMemo)return this._nightlineHourMemo;const e=function(e){let t=li.get(e);return t||(t=new Intl.DateTimeFormat("en-GB",{timeZone:e,hour:"2-digit",minute:"2-digit",hour12:!1}),li.set(e,t)),t}("Europe/Vienna").formatToParts(new Date),t=Number(e.find(e=>"hour"===e.type)?.value??"0"),i=Number(e.find(e=>"minute"===e.type)?.value??"0"),r=60*t+i,n=r>=1435||r<=315;return this._nightlineHourMemo=n,n}_rowKey(e,t){const i=e.time_planned??`cd${e.countdown}`;return`${t}|${e.line}|${e.direction}|${e.towards??""}|${i}`}_panelId(e,t,i){const r=yt(t),n="hero"===i?"wl-hero-stopsahead":"wl-stopsahead",a=(e.time_planned??`cd${e.countdown}`).replace(/[^a-z0-9_-]/gi,"_");return`${n}-${r}-${e.line}-${e.direction}-${a}`}_toggleRow(e){this._expandedRows=xt(this._expandedRows,e)}_transferKey(e,t){return`${e}|${t}`}_stopMapUrl(e,t,i){let r=null;return"number"==typeof t&&"number"==typeof i?r=`https://stadtplan.wien.gv.at/#/@${i},${t},17.5,0,0,standard/themes`:e&&(r=`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${e}, Wien`)}`),r?("string"!=typeof(n=r)?"":/^https?:\/\//i.test(n)?n:"")||null:null;var n}_stopGeoUri(e,t,i){if("number"!=typeof t||"number"!=typeof i)return null;return`geo:${t},${i}?q=${t},${i}${e?`(${encodeURIComponent(e)})`:""}`}_toggleQrFor(e){this._qrOpenFor=this._qrOpenFor===e?null:e}_renderQrPanel(e,t,i,r,n){const a=`wl-qr-${yt(e)}`,o=this._t("qr_dialog_title"),s=this._t("qr_dialog_hint");return W`
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
    `}_isDevMode(){try{if((window.location.search||"").includes("wl_debug=1"))return!0;if("1"===window.localStorage?.getItem("wl_debug"))return!0}catch(e){console.warn("[wiener-linien-austria-card] dev-mode probe failed (SSR/restricted ctx?)",e)}return!1}_renderDevModePanel(){return this._isDevMode()?W`
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
      ${this._devPaletteOpen?this._renderDevPalette():I}
    `:I}static{this.DEV_GROUNDS={dark:"#1c1c1c",light:"#ffffff"}}static{this.DEV_SURFACES=[{label:"hero",ratio:.12},{label:"row",ratio:.06}]}static{this.DEV_PALETTE=[{label:"U1",hex:"#E3000F"},{label:"U2",hex:"#A862A4"},{label:"U3",hex:"#EF7C00"},{label:"U4",hex:"#319F49"},{label:"U6",hex:"#9D6830"},{label:"Tram",hex:"#C00808"},{label:"Bus",hex:"#0A295D"},{label:"Nightline",hex:Ee},{label:"Badner Bahn",hex:"#000000"},{label:"Weiß",hex:"#FFFFFF"}]}_devPaletteEntries(){const e=oi.DEV_PALETTE.map(e=>({...e,live:!1})),t=new Set(e.map(e=>e.hex.toUpperCase())),i=mt(this.hass,(this._config?.entities??[]).map(e=>e.entity));for(const[r,n]of Object.entries(i)){if(!n?.bg)continue;const i=`#${n.bg}`.toUpperCase();t.has(i)||(t.add(i),e.push({label:r,hex:i,live:!0}))}return e}_renderDevPalette(){return W`
      <div class="dev-palette">
        ${this._devPaletteEntries().map(e=>this._renderDevPaletteRow(e))}
      </div>
    `}_renderDevPaletteRow(e){return W`
      <div class="dev-pal-row">
        <div class="dev-pal-id">
          <span class="dev-pal-badge" style="background: ${e.hex};">${e.label}</span>
          <code>${e.hex.toUpperCase()}${e.live?" ·live":""}</code>
        </div>
        ${["dark","light"].map(t=>{const i=Ft(e.hex,t),r=oi.DEV_GROUNDS[t];return W`
            <div class="dev-pal-scheme" style="background: ${r};">
              <span class="dev-pal-scheme-label">${t}</span>
              ${oi.DEV_SURFACES.map(t=>{const n=function(e,t,i){const r=qt(e),n=qt(t);if(!r||!n)return null;const a=[0,1,2].map(e=>Nt(Bt(r[e])*i+Bt(n[e])*(1-i)));return"#"+a.map(e=>Math.round(255*e).toString(16).padStart(2,"0")).join("")}(e.hex,r,t.ratio)??r,a=i?function(e,t){const i=qt(e),r=qt(t);if(!i||!r)return null;const n=Wt(i),a=Wt(r);return(Math.max(n,a)+.05)/(Math.min(n,a)+.05)}(i,n):null,o=null!==a&&a>=4.5;return W`
                  <div class="dev-pal-chip" style="background: ${n};">
                    <span
                      class="dev-pal-word"
                      style=${i?`color: ${i};`:I}
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
    `}_randomFrom(e){if(0===e.length)return null;return e[Math.floor(Math.random()*e.length)]}static{this.DEV_TRAFFIC_SHAPES=[{label:"Bauarbeiten",html:(e,t)=>`<p>Die Linie ${e} fährt derzeit nicht Richtung ${t}.</p><p><br></p><p>Weichen Sie ersatzweise auf die Linien E3, 46 und 49 aus.</p><p><br></p><p>Voraussichtliche Dauer: 31. August.</p><p><br></p><p>Grund: Bauarbeiten im Bereich zwischen Westbahnhof U und Hütteldorfer Straße U.</p>`},{label:"Run-on (ungetrennt)",html:e=>`<p>Linie ${e}:Betrieb nur zwischen Schottentor U und Dornbach. Weichen Sie ersatzweise auf die Linie 43A aus.Voraussichtliche Dauer: 31.07.2026.Grund: Gleisbauarbeiten im Bereich Dornbacher Straße.</p>`},{label:"Mehrere Linien",html:e=>`<p>Linie ${e}:</p><p>Kein Betrieb zwischen Lerchenfelder Straße und Franz-Josefs-Bahnhof S.</p><p>Betrieb zwischen Westbahnhof S U und Lerchenfelder Straße.</p><p>Linie 12:</p><p>Betrieb nur zwischen Hillerstraße und Franz-Josefs-Bahnhof S.</p><p>Linien 40, 41, 42:</p><p>Kein Betrieb. Die Außenäste werden von den Linien 37 und 38 übernommen.</p><p>Die Störung dauert voraussichtlich bis Ende August.</p>`},{label:"Unfall, Uhrzeit",html:e=>`<p>Linie ${e}:</p><p>Unregelmäßige Intervalle in beiden Richtungen.</p><p>Voraussichtliche Dauer: 11:30 Uhr.</p><p>Grund: Verkehrsunfall im Bereich Gersthofer Straße 140.</p>`},{label:"Unbekannter Grund",html:e=>`<p>Linie ${e}:</p><p>Es kommt zu Verzögerungen im Betrieb.</p><p>Voraussichtliche Dauer: Ende August.</p><p>Grund: Vorübergehend nicht näher bekannte Ursache.</p>`}]}static{this.styles=Ae}};e([pe({attribute:!1})],di.prototype,"hass",void 0),e([ue()],di.prototype,"_config",void 0),e([ue()],di.prototype,"_activeTab",void 0),e([ue()],di.prototype,"_versionMismatch",void 0),e([ue()],di.prototype,"_expandedTraffic",void 0),e([ue()],di.prototype,"_expandedElevator",void 0),e([ue()],di.prototype,"_expandedRows",void 0),e([ue()],di.prototype,"_expandedTransfers",void 0),e([ue()],di.prototype,"_debugTraffic",void 0),e([ue()],di.prototype,"_debugElevator",void 0),e([ue()],di.prototype,"_qrOpenFor",void 0),e([ue()],di.prototype,"_devPaletteOpen",void 0),di=oi=e([de("wiener-linien-austria-card")],di);export{di as WienerLinienAustriaCard};

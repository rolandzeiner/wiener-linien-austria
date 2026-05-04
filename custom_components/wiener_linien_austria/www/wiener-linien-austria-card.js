// Wiener Linien Austria — bundled by Rollup. Edit sources in src/, then `npm run build`.
function e(e,t,i,r){var n,a=arguments.length,o=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,r);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(o=(a<3?n(o):a>3?n(t,i,o):n(t,i))||o);return a>3&&o&&Object.defineProperty(t,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),n=new WeakMap;let a=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=n.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(t,e))}return e}toString(){return this.cssText}};const o=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[r+1],e[0]);return new a(i,e,r)},s=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new a("string"==typeof e?e:e+"",void 0,r))(t)})(e):e,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,f=globalThis,_=f.trustedTypes,g=_?_.emptyScript:"",m=f.reactiveElementPolyfillSupport,b=(e,t)=>e,v={toAttribute(e,t){switch(t){case Boolean:e=e?g:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},w=(e,t)=>!l(e,t),y={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:w};Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=y){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);void 0!==r&&d(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:n}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){const a=r?.call(this);n?.call(this,t),this.requestUpdate(e,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??y}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(s(e))}else void 0!==e&&t.push(s(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,r)=>{if(i)e.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of r){const r=document.createElement("style"),n=t.litNonce;void 0!==n&&r.setAttribute("nonce",n),r.textContent=i.cssText,e.appendChild(r)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(void 0!==r&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:v).toAttribute(t,i.type);this._$Em=e,null==n?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(void 0!==r&&this._$Em!==r){const e=i.getPropertyOptions(r),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:v;this._$Em=r;const a=n.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,i,r=!1,n){if(void 0!==e){const a=this.constructor;if(!1===r&&(n=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??w)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:n},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==n||void 0!==a)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,r=this[t];!0!==e||this._$AL.has(t)||void 0===r||this.C(t,void 0,i,r)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[b("elementProperties")]=new Map,x[b("finalized")]=new Map,m?.({ReactiveElement:x}),(f.reactiveElementVersions??=[]).push("2.1.2");const $=globalThis,k=e=>e,A=$.trustedTypes,S=A?A.createPolicy("lit-html",{createHTML:e=>e}):void 0,z="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,T="?"+E,C=`<${T}>`,M=document,H=()=>M.createComment(""),R=e=>null===e||"object"!=typeof e&&"function"!=typeof e,L=Array.isArray,P="[ \t\n\f\r]",D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,N=/>/g,U=RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),q=/'/g,j=/"/g,F=/^(?:script|style|textarea|title)$/i,B=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),V=Symbol.for("lit-noChange"),I=Symbol.for("lit-nothing"),W=new WeakMap,K=M.createTreeWalker(M,129);function G(e,t){if(!L(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(t):t}const Q=(e,t)=>{const i=e.length-1,r=[];let n,a=2===t?"<svg>":3===t?"<math>":"",o=D;for(let t=0;t<i;t++){const i=e[t];let s,l,d=-1,c=0;for(;c<i.length&&(o.lastIndex=c,l=o.exec(i),null!==l);)c=o.lastIndex,o===D?"!--"===l[1]?o=O:void 0!==l[1]?o=N:void 0!==l[2]?(F.test(l[2])&&(n=RegExp("</"+l[2],"g")),o=U):void 0!==l[3]&&(o=U):o===U?">"===l[0]?(o=n??D,d=-1):void 0===l[1]?d=-2:(d=o.lastIndex-l[2].length,s=l[1],o=void 0===l[3]?U:'"'===l[3]?j:q):o===j||o===q?o=U:o===O||o===N?o=D:(o=U,n=void 0);const h=o===U&&e[t+1].startsWith("/>")?" ":"";a+=o===D?i+C:d>=0?(r.push(s),i.slice(0,d)+z+i.slice(d)+E+h):i+E+(-2===d?t:h)}return[G(e,a+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),r]};class Z{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let n=0,a=0;const o=e.length-1,s=this.parts,[l,d]=Q(e,t);if(this.el=Z.createElement(l,i),K.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(r=K.nextNode())&&s.length<o;){if(1===r.nodeType){if(r.hasAttributes())for(const e of r.getAttributeNames())if(e.endsWith(z)){const t=d[a++],i=r.getAttribute(e).split(E),o=/([.?@])?(.*)/.exec(t);s.push({type:1,index:n,name:o[2],strings:i,ctor:"."===o[1]?te:"?"===o[1]?ie:"@"===o[1]?re:ee}),r.removeAttribute(e)}else e.startsWith(E)&&(s.push({type:6,index:n}),r.removeAttribute(e));if(F.test(r.tagName)){const e=r.textContent.split(E),t=e.length-1;if(t>0){r.textContent=A?A.emptyScript:"";for(let i=0;i<t;i++)r.append(e[i],H()),K.nextNode(),s.push({type:2,index:++n});r.append(e[t],H())}}}else if(8===r.nodeType)if(r.data===T)s.push({type:2,index:n});else{let e=-1;for(;-1!==(e=r.data.indexOf(E,e+1));)s.push({type:7,index:n}),e+=E.length-1}n++}}static createElement(e,t){const i=M.createElement("template");return i.innerHTML=e,i}}function J(e,t,i=e,r){if(t===V)return t;let n=void 0!==r?i._$Co?.[r]:i._$Cl;const a=R(t)?void 0:t._$litDirective$;return n?.constructor!==a&&(n?._$AO?.(!1),void 0===a?n=void 0:(n=new a(e),n._$AT(e,i,r)),void 0!==r?(i._$Co??=[])[r]=n:i._$Cl=n),void 0!==n&&(t=J(e,n._$AS(e,t.values),n,r)),t}class Y{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??M).importNode(t,!0);K.currentNode=r;let n=K.nextNode(),a=0,o=0,s=i[0];for(;void 0!==s;){if(a===s.index){let t;2===s.type?t=new X(n,n.nextSibling,this,e):1===s.type?t=new s.ctor(n,s.name,s.strings,this,e):6===s.type&&(t=new ne(n,this,e)),this._$AV.push(t),s=i[++o]}a!==s?.index&&(n=K.nextNode(),a++)}return K.currentNode=M,r}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=I,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),R(e)?e===I||null==e||""===e?(this._$AH!==I&&this._$AR(),this._$AH=I):e!==this._$AH&&e!==V&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>L(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==I&&R(this._$AH)?this._$AA.nextSibling.data=e:this.T(M.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Z.createElement(G(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const e=new Y(r,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=W.get(e.strings);return void 0===t&&W.set(e.strings,t=new Z(e)),t}k(e){L(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const n of e)r===t.length?t.push(i=new X(this.O(H()),this.O(H()),this,this.options)):i=t[r],i._$AI(n),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}let ee=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,n){this.type=1,this._$AH=I,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=I}_$AI(e,t=this,i,r){const n=this.strings;let a=!1;if(void 0===n)e=J(this,e,t,0),a=!R(e)||e!==this._$AH&&e!==V,a&&(this._$AH=e);else{const r=e;let o,s;for(e=n[0],o=0;o<n.length-1;o++)s=J(this,r[i+o],t,o),s===V&&(s=this._$AH[o]),a||=!R(s)||s!==this._$AH[o],s===I?e=I:e!==I&&(e+=(s??"")+n[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===I?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}};class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===I?void 0:e}}class ie extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==I)}}class re extends ee{constructor(e,t,i,r,n){super(e,t,i,r,n),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??I)===V)return;const i=this._$AH,r=e===I&&i!==I||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==I&&(i===I||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const ae=$.litHtmlPolyfillSupport;ae?.(Z,X),($.litHtmlVersions??=[]).push("3.3.2");const oe=globalThis;let se=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const r=i?.renderBefore??t;let n=r._$litPart$;if(void 0===n){const e=i?.renderBefore??null;r._$litPart$=n=new X(t.insertBefore(H(),e),e,void 0,i??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}};se._$litElement$=!0,se.finalized=!0,oe.litElementHydrateSupport?.({LitElement:se});const le=oe.litElementPolyfillSupport;le?.({LitElement:se}),(oe.litElementVersions??=[]).push("4.2.2");const de=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},ce={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:w},he=(e=ce,t,i)=>{const{kind:r,metadata:n}=i;let a=globalThis.litPropertyMetadata.get(n);if(void 0===a&&globalThis.litPropertyMetadata.set(n,a=new Map),"setter"===r&&((e=Object.create(e)).wrapped=!0),a.set(i.name,e),"accessor"===r){const{name:r}=i;return{set(i){const n=t.get.call(this);t.set.call(this,i),this.requestUpdate(r,n,e,!0,i)},init(t){return void 0!==t&&this.C(r,void 0,e,t),t}}}if("setter"===r){const{name:r}=i;return function(i){const n=this[r];t.call(this,i),this.requestUpdate(r,n,e,!0,i)}}throw Error("Unsupported decorator location: "+r)};function pe(e){return(t,i)=>"object"==typeof i?he(e,t,i):((e,t,i)=>{const r=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),r?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function ue(e){return pe({...e,state:!0,attribute:!1})}const fe=1,_e=2,ge=e=>(...t)=>({_$litDirective$:e,values:t});let me=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},be=class extends me{constructor(e){if(super(e),this.it=I,e.type!==_e)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===I||null==e)return this._t=void 0,this.it=e;if(e===V)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}};be.directiveName="unsafeHTML",be.resultType=1;const ve=ge(be),we=ge(class extends me{constructor(e){if(super(e),e.type!==fe||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e)));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const i=e.element.classList;for(const e of this.st)e in t||(i.remove(e),this.st.delete(e));for(const e in t){const r=!!t[e];r===this.st.has(e)||this.nt?.has(e)||(r?(i.add(e),this.st.add(e)):(i.remove(e),this.st.delete(e)))}return V}}),ye="important",xe=" !"+ye,$e=ge(class extends me{constructor(e){if(super(e),e.type!==fe||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,i)=>{const r=e[i];return null==r?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?i.removeProperty(e):i[e]=null);for(const e in t){const r=t[e];if(null!=r){this.ft.add(e);const t="string"==typeof r&&r.endsWith(xe);e.includes("-")||t?i.setProperty(e,t?r.slice(0,-11):r,t?ye:""):i[e]=r}}return V}});let ke=null;class Ae{}Ae.render=function(e,t){ke(e,t)},self.QrCreator=Ae,function(e){function t(t,i,r,n){var a={},o=e(r,i);o.u(t),o.J(),n=n||0;var s=o.h(),l=o.h()+2*n;return a.text=t,a.level=i,a.version=r,a.O=l,a.a=function(e,t){return t-=n,!(0>(e-=n)||e>=s||0>t||t>=s)&&o.a(e,t)},a}function i(e,t,i,r,n,a,o,s,l,d){function c(t,i,r,n,o,s,l){t?(e.lineTo(i+s,r+l),e.arcTo(i,r,n,o,a)):e.lineTo(i,r)}o?e.moveTo(t+a,i):e.moveTo(t,i),c(s,r,i,r,n,-a,0),c(l,r,n,t,n,0,-a),c(d,t,n,t,i,a,0),c(o,t,i,r,i,0,a)}function r(e,t,i,r,n,a,o,s,l,d){function c(t,i,r,n){e.moveTo(t+r,i),e.lineTo(t,i),e.lineTo(t,i+n),e.arcTo(t,i,t+r,i,a)}o&&c(t,i,a,a),s&&c(r,i,-a,a),l&&c(r,n,-a,-a),d&&c(t,n,a,-a)}function n(e,n){e:{var a=n.text,o=n.v,s=n.N,l=n.K,d=n.P;for(s=Math.max(1,s||1),l=Math.min(40,l||40);s<=l;s+=1)try{var c=t(a,o,s,d);break e}catch(e){}c=void 0}if(!c)return null;for(a=e.getContext("2d"),n.background&&(a.fillStyle=n.background,a.fillRect(n.left,n.top,n.size,n.size)),o=c.O,l=n.size/o,a.beginPath(),d=0;d<o;d+=1)for(s=0;s<o;s+=1){var h=a,p=n.left+s*l,u=n.top+d*l,f=d,_=s,g=c.a,m=p+l,b=u+l,v=f-1,w=f+1,y=_-1,x=_+1,$=Math.floor(Math.min(.5,Math.max(0,n.R))*l),k=g(f,_),A=g(v,y),S=g(v,_);v=g(v,x);var z=g(f,x);x=g(w,x),_=g(w,_),w=g(w,y),f=g(f,y),p=Math.round(p),u=Math.round(u),m=Math.round(m),b=Math.round(b),k?i(h,p,u,m,b,$,!S&&!f,!S&&!z,!_&&!z,!_&&!f):r(h,p,u,m,b,$,S&&f&&A,S&&z&&v,_&&z&&x,_&&f&&w)}return function(e,t){var i=t.fill;if("string"==typeof i)e.fillStyle=i;else{var r=i.type,n=i.colorStops;if(i=i.position.map(e=>Math.round(e*t.size)),"linear-gradient"===r)var a=e.createLinearGradient.apply(e,i);else{if("radial-gradient"!==r)throw Error("Unsupported fill");a=e.createRadialGradient.apply(e,i)}n.forEach(([e,t])=>{a.addColorStop(e,t)}),e.fillStyle=a}}(a,n),a.fill(),e}var a={minVersion:1,maxVersion:40,ecLevel:"L",left:0,top:0,size:200,fill:"#000",background:null,text:"no text",radius:.5,quiet:0};ke=function(e,t){var i={};Object.assign(i,a,e),i.N=i.minVersion,i.K=i.maxVersion,i.v=i.ecLevel,i.left=i.left,i.top=i.top,i.size=i.size,i.fill=i.fill,i.background=i.background,i.text=i.text,i.R=i.radius,i.P=i.quiet,t instanceof HTMLCanvasElement?(t.width===i.size&&t.height===i.size||(t.width=i.size,t.height=i.size),t.getContext("2d").clearRect(0,0,t.width,t.height),n(t,i)):((e=document.createElement("canvas")).width=i.size,e.height=i.size,i=n(e,i),t.appendChild(i))}}(function(){function e(n,o){function s(e,t){for(var i=-1;7>=i;i+=1)if(!(-1>=e+i||h<=e+i))for(var r=-1;7>=r;r+=1)-1>=t+r||h<=t+r||(c[e+i][t+r]=0<=i&&6>=i&&(0==r||6==r)||0<=r&&6>=r&&(0==i||6==i)||2<=i&&4>=i&&2<=r&&4>=r)}function l(e,i){for(var o=h=4*n+17,l=Array(o),f=0;f<o;f+=1){l[f]=Array(o);for(var _=0;_<o;_+=1)l[f][_]=null}for(c=l,s(0,0),s(h-7,0),s(0,h-7),o=r.G(n),l=0;l<o.length;l+=1)for(f=0;f<o.length;f+=1){_=o[l];var g=o[f];if(null==c[_][g])for(var m=-2;2>=m;m+=1)for(var b=-2;2>=b;b+=1)c[_+m][g+b]=-2==m||2==m||-2==b||2==b||0==m&&0==b}for(o=8;o<h-8;o+=1)null==c[o][6]&&(c[o][6]=0==o%2);for(o=8;o<h-8;o+=1)null==c[6][o]&&(c[6][o]=0==o%2);for(o=r.w(d<<3|i),l=0;15>l;l+=1)f=!e&&1==(o>>l&1),c[6>l?l:8>l?l+1:h-15+l][8]=f,c[8][8>l?h-l-1:9>l?15-l:14-l]=f;if(c[h-8][8]=!e,7<=n){for(o=r.A(n),l=0;18>l;l+=1)f=!e&&1==(o>>l&1),c[Math.floor(l/3)][l%3+h-8-3]=f;for(l=0;18>l;l+=1)f=!e&&1==(o>>l&1),c[l%3+h-8-3][Math.floor(l/3)]=f}if(null==p){for(e=a.I(n,d),o=function(){var e=[],t=0,i={B:function(){return e},c:function(t){return 1==(e[Math.floor(t/8)]>>>7-t%8&1)},put:function(e,t){for(var r=0;r<t;r+=1)i.m(1==(e>>>t-r-1&1))},f:function(){return t},m:function(i){var r=Math.floor(t/8);e.length<=r&&e.push(0),i&&(e[r]|=128>>>t%8),t+=1}};return i}(),l=0;l<u.length;l+=1)f=u[l],o.put(4,4),o.put(f.b(),r.f(4,n)),f.write(o);for(l=f=0;l<e.length;l+=1)f+=e[l].j;if(o.f()>8*f)throw Error("code length overflow. ("+o.f()+">"+8*f+")");for(o.f()+4<=8*f&&o.put(0,4);0!=o.f()%8;)o.m(!1);for(;!(o.f()>=8*f)&&(o.put(236,8),!(o.f()>=8*f));)o.put(17,8);var v=0;for(f=l=0,_=Array(e.length),g=Array(e.length),m=0;m<e.length;m+=1){var w=e[m].j,y=e[m].o-w;for(l=Math.max(l,w),f=Math.max(f,y),_[m]=Array(w),b=0;b<_[m].length;b+=1)_[m][b]=255&o.B()[b+v];for(v+=w,b=r.C(y),w=t(_[m],b.b()-1).l(b),g[m]=Array(b.b()-1),b=0;b<g[m].length;b+=1)y=b+w.b()-g[m].length,g[m][b]=0<=y?w.c(y):0}for(b=o=0;b<e.length;b+=1)o+=e[b].o;for(o=Array(o),b=v=0;b<l;b+=1)for(m=0;m<e.length;m+=1)b<_[m].length&&(o[v]=_[m][b],v+=1);for(b=0;b<f;b+=1)for(m=0;m<e.length;m+=1)b<g[m].length&&(o[v]=g[m][b],v+=1);p=o}for(e=p,o=-1,l=h-1,f=7,_=0,i=r.F(i),g=h-1;0<g;g-=2)for(6==g&&--g;;){for(m=0;2>m;m+=1)null==c[l][g-m]&&(b=!1,_<e.length&&(b=1==(e[_]>>>f&1)),i(l,g-m)&&(b=!b),c[l][g-m]=b,-1==--f&&(_+=1,f=7));if(0>(l+=o)||h<=l){l-=o,o=-o;break}}}var d=i[o],c=null,h=0,p=null,u=[],f={u:function(t){t=function(t){var i=e.s(t);return{S:function(){return 4},b:function(){return i.length},write:function(e){for(var t=0;t<i.length;t+=1)e.put(i[t],8)}}}(t),u.push(t),p=null},a:function(e,t){if(0>e||h<=e||0>t||h<=t)throw Error(e+","+t);return c[e][t]},h:function(){return h},J:function(){for(var e=0,t=0,i=0;8>i;i+=1){l(!0,i);var n=r.D(f);(0==i||e>n)&&(e=n,t=i)}l(!1,t)}};return f}function t(e,i){if(void 0===e.length)throw Error(e.length+"/"+i);var r=function(){for(var t=0;t<e.length&&0==e[t];)t+=1;for(var r=Array(e.length-t+i),n=0;n<e.length-t;n+=1)r[n]=e[n+t];return r}(),a={c:function(e){return r[e]},b:function(){return r.length},multiply:function(e){for(var i=Array(a.b()+e.b()-1),r=0;r<a.b();r+=1)for(var o=0;o<e.b();o+=1)i[r+o]^=n.i(n.g(a.c(r))+n.g(e.c(o)));return t(i,0)},l:function(e){if(0>a.b()-e.b())return a;for(var i=n.g(a.c(0))-n.g(e.c(0)),r=Array(a.b()),o=0;o<a.b();o+=1)r[o]=a.c(o);for(o=0;o<e.b();o+=1)r[o]^=n.i(n.g(e.c(o))+i);return t(r,0).l(e)}};return a}e.s=function(e){for(var t=[],i=0;i<e.length;i++){var r=e.charCodeAt(i);128>r?t.push(r):2048>r?t.push(192|r>>6,128|63&r):55296>r||57344<=r?t.push(224|r>>12,128|r>>6&63,128|63&r):(i++,r=65536+((1023&r)<<10|1023&e.charCodeAt(i)),t.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|63&r))}return t};var i={L:1,M:0,Q:3,H:2},r=function(){function e(e){for(var t=0;0!=e;)t+=1,e>>>=1;return t}var i=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],r={w:function(t){for(var i=t<<10;0<=e(i)-e(1335);)i^=1335<<e(i)-e(1335);return 21522^(t<<10|i)},A:function(t){for(var i=t<<12;0<=e(i)-e(7973);)i^=7973<<e(i)-e(7973);return t<<12|i},G:function(e){return i[e-1]},F:function(e){switch(e){case 0:return function(e,t){return 0==(e+t)%2};case 1:return function(e){return 0==e%2};case 2:return function(e,t){return 0==t%3};case 3:return function(e,t){return 0==(e+t)%3};case 4:return function(e,t){return 0==(Math.floor(e/2)+Math.floor(t/3))%2};case 5:return function(e,t){return 0==e*t%2+e*t%3};case 6:return function(e,t){return 0==(e*t%2+e*t%3)%2};case 7:return function(e,t){return 0==(e*t%3+(e+t)%2)%2};default:throw Error("bad maskPattern:"+e)}},C:function(e){for(var i=t([1],0),r=0;r<e;r+=1)i=i.multiply(t([1,n.i(r)],0));return i},f:function(e,t){if(4!=e||1>t||40<t)throw Error("mode: "+e+"; type: "+t);return 10>t?8:16},D:function(e){for(var t=e.h(),i=0,r=0;r<t;r+=1)for(var n=0;n<t;n+=1){for(var a=0,o=e.a(r,n),s=-1;1>=s;s+=1)if(!(0>r+s||t<=r+s))for(var l=-1;1>=l;l+=1)0>n+l||t<=n+l||(0!=s||0!=l)&&o==e.a(r+s,n+l)&&(a+=1);5<a&&(i+=3+a-5)}for(r=0;r<t-1;r+=1)for(n=0;n<t-1;n+=1)a=0,e.a(r,n)&&(a+=1),e.a(r+1,n)&&(a+=1),e.a(r,n+1)&&(a+=1),e.a(r+1,n+1)&&(a+=1),(0==a||4==a)&&(i+=3);for(r=0;r<t;r+=1)for(n=0;n<t-6;n+=1)e.a(r,n)&&!e.a(r,n+1)&&e.a(r,n+2)&&e.a(r,n+3)&&e.a(r,n+4)&&!e.a(r,n+5)&&e.a(r,n+6)&&(i+=40);for(n=0;n<t;n+=1)for(r=0;r<t-6;r+=1)e.a(r,n)&&!e.a(r+1,n)&&e.a(r+2,n)&&e.a(r+3,n)&&e.a(r+4,n)&&!e.a(r+5,n)&&e.a(r+6,n)&&(i+=40);for(n=a=0;n<t;n+=1)for(r=0;r<t;r+=1)e.a(r,n)&&(a+=1);return i+Math.abs(100*a/t/t-50)/5*10}};return r}(),n=function(){for(var e=Array(256),t=Array(256),i=0;8>i;i+=1)e[i]=1<<i;for(i=8;256>i;i+=1)e[i]=e[i-4]^e[i-5]^e[i-6]^e[i-8];for(i=0;255>i;i+=1)t[e[i]]=i;return{g:function(e){if(1>e)throw Error("glog("+e+")");return t[e]},i:function(t){for(;0>t;)t+=255;for(;256<=t;)t-=255;return e[t]}}}(),a=function(){function e(e,r){switch(r){case i.L:return t[4*(e-1)];case i.M:return t[4*(e-1)+1];case i.Q:return t[4*(e-1)+2];case i.H:return t[4*(e-1)+3]}}var t=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],r={I:function(t,i){var r=e(t,i);if(void 0===r)throw Error("bad rs block @ typeNumber:"+t+"/errorCorrectLevel:"+i);t=r.length/3,i=[];for(var n=0;n<t;n+=1)for(var a=r[3*n],o=r[3*n+1],s=r[3*n+2],l=0;l<a;l+=1){var d=s,c={};c.o=o,c.j=d,i.push(c)}return i}};return r}();return e}());var Se=QrCreator;const ze=o`
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

    /* Semantic state tokens layered over HA's official semantic palette
       so theme authors can recolour the whole portfolio in one place;
       hard-coded fallbacks for older HA versions. */
    --wl-rt:      var(--ha-color-success, #43a047);
    --wl-warning: var(--ha-color-warning, #ffa000);
    --wl-error:   var(--ha-color-error,   #db4437);
    --wl-info:    var(--ha-color-info,    #1565c0);
    /* ISA / ISO 7001 accessibility blue (Pantone 285 C). Kept on its
       own token — separate from --wl-info — so the wheelchair pill
       always renders in the standards-correct colour, while themes can
       still override if they need to. */
    --wl-a11y:    #0072CE;

    /* Spacing / radius / sizing — layered over the HA Design System
       so the card moves with HA when tokens evolve. Values match
       linz-linien-austria so a stacked dashboard reads as one
       family. */
    --wl-radius-sm: var(--ha-radius-sm, 6px);
    --wl-radius-md: var(--ha-radius-md, 10px);
    --wl-radius-lg: var(--ha-card-border-radius, var(--ha-radius-lg, 12px));
    --wl-pad-x:     var(--ha-spacing-4, 16px);
    --wl-pad-y:     var(--ha-spacing-3, 14px);
    --wl-row-gap:   var(--ha-spacing-3, 12px);
    --wl-tile-size: 40px;
    --wl-slot-radius: var(--ha-radius-md, 10px);
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
    transition: color var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease), box-shadow var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease);
  }
  .tab:hover {
    color: var(--primary-text-color);
  }
  .tab.active {
    color: var(--primary-color);
    font-weight: var(--ha-font-weight-bold, 600);
    box-shadow: inset 0 -2px 0 var(--primary-color);
  }

  /* Per-station section. Inline --wl-accent on this element drives the
     icon-tile tint, line-badge fallback, alert tints, and CTA fill. */
  .station {
    display: flex;
    flex-direction: column;
    gap: var(--wl-row-gap);
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
    color: var(--wl-accent);
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
    font-size: var(--ha-font-size-m, 0.9375rem);
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
    transition: background-color var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease), color var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease);
  }
  .icon-action:hover {
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    color: var(--primary-text-color);
  }
  .icon-action ha-icon {
    --mdc-icon-size: 20px;
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
    column-gap: var(--ha-spacing-3, 12px);
    row-gap: 6px;
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
  }
  .hero > .hero-entry {
    grid-column: 2;
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
    color: var(--wl-accent);
  }
  .hero-min {
    font-size: var(--wl-metric-size);
    font-weight: var(--ha-font-weight-bold, 600);
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
    padding: var(--ha-spacing-3, 12px) var(--wl-pad-x);
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
      var(--ha-transition-duration-fast, 160ms)
      var(--ha-transition-easing-standard, ease);
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
    transition: grid-template-rows 0.24s ease;
  }
  .hero-detail-inner {
    overflow: hidden;
    min-height: 0;
  }
  .hero-detail.expanded {
    grid-template-rows: 1fr;
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
    font-size: var(--ha-font-size-xs, 0.75rem);
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
  /* Hero accessibility flag — small icon-only pill, only rendered
     when the next departure is barrier-free AND the user has
     show_accessibility enabled. */
  .hero-a11y {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: var(--wl-a11y);
    padding: 2px 6px;
    border-radius: 999px;
    flex-shrink: 0;
    forced-color-adjust: none;
  }
  .hero-a11y ha-icon {
    --mdc-icon-size: 16px;
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
    transition: filter var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease), transform 0.06s ease;
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
    font-weight: var(--ha-font-weight-bold, 600);
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
    transition: transform var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease);
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
    grid-template-columns: max-content 1fr auto auto auto;
    align-items: center;
    gap: 8px;
    padding: 6px 2px;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    transition: background-color
      var(--ha-transition-duration-fast, 160ms)
      var(--ha-transition-easing-standard, ease);
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
  }
  .row-chevron {
    --mdc-icon-size: 18px;
    color: var(--secondary-text-color);
    flex-shrink: 0;
    transition: transform
      var(--ha-transition-duration-fast, 160ms)
      var(--ha-transition-easing-standard, ease);
  }
  .dep-row.expanded .row-chevron {
    transform: rotate(180deg);
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
    --stops-ahead-dot-size: 10px;
    --stops-ahead-line-width: 2px;
    list-style: none;
    margin: 0;
    padding: 8px 10px 10px 0;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: var(--secondary-text-color);
    font-size: 0.85rem;
    line-height: 1.3;
  }
  /* The vertical line. Sits behind the dots (they have higher z-index)
     and stops at the centre of the first/last dot via a clip on the
     containing list — easiest done by pinning top/bottom to half the
     dot size. The dot column hugs the panel's left edge so long
     station names get the maximum readable width on narrow cards. */
  .stops-ahead::before {
    content: "";
    position: absolute;
    left: calc(var(--stops-ahead-dot-size) / 2 - var(--stops-ahead-line-width) / 2);
    top: calc(8px + var(--stops-ahead-dot-size) / 2);
    bottom: calc(10px + var(--stops-ahead-dot-size) / 2);
    width: var(--stops-ahead-line-width);
    background: var(--stops-ahead-line);
    border-radius: 2px;
  }
  .stops-ahead-stop {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-left: calc(var(--stops-ahead-dot-size) + 10px);
    min-height: var(--stops-ahead-dot-size);
  }
  .stops-ahead-row {
    display: flex;
    align-items: center;
    gap: 8px;
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
    gap: 4px;
    flex-shrink: 0;
  }
  .stops-ahead-line-chip {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: var(--ha-font-weight-bold, 600);
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
    font-weight: var(--ha-font-weight-bold, 600);
    cursor: pointer;
    flex-shrink: 0;
    line-height: 1.4;
  }
  .stops-ahead-other-toggle ha-icon {
    --mdc-icon-size: 14px;
    transition: transform
      var(--ha-transition-duration-fast, 160ms)
      var(--ha-transition-easing-standard, ease);
  }
  .stops-ahead-stop.transfers-expanded .stops-ahead-other-toggle ha-icon {
    transform: rotate(180deg);
  }
  /* Second-row container for non-metro chips. Wraps freely; sits below
     the station-name row so its width never pushes the layout. */
  .stops-ahead-others {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 2px;
  }
  /* Non-metro chips render slightly lighter so the inline U-Bahn chips
     stay the dominant signal. */
  .stops-ahead-line-chip--other {
    opacity: 0.92;
  }
  .line-badge {
    text-align: center;
    font-weight: var(--ha-font-weight-bold, 600);
    color: #fff;
    border-radius: 6px;
    padding: 3px 8px;
    min-width: 2.4em;
    font-size: 0.85rem;
    background: var(--primary-color);
    box-shadow: inset 0 -2px 0 color-mix(in srgb, #000 18%, transparent);
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
    font-size: var(--ha-font-size-xs, 0.7rem);
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
    font-variant-numeric: tabular-nums;
    font-weight: 600;
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
  .countdown.now   { color: var(--wl-accent); }
  .countdown.late  { color: var(--wl-error); }
  .countdown.early { color: var(--wl-rt); }

  /* Empty / fallback states */
  .empty {
    padding: 18px 0;
    color: var(--secondary-text-color);
    text-align: center;
    font-size: 0.85rem;
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
      gap: 6px;
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
    /* Wide enough to afford the metro-map alignment: dots + connecting
       line indent under the line-badge column so the trail descends
       visually from under the badge. Narrow cards keep the flush-left
       layout above for readability of long station names. */
    .stops-ahead {
      padding-left: calc(2.4em + 8px);
    }
    .stops-ahead::before {
      left: calc(2.4em + 8px + var(--stops-ahead-dot-size) / 2 - var(--stops-ahead-line-width) / 2);
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
  @media (forced-colors: active) {
    .icon-tile,
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
`;var Ee={no_data:"Keine Abfahrten verfügbar",betriebsschluss:"Betriebsschluss",min:"Min",now:"Jetzt",platform_short_rail:"Gleis",platform_short_bus:"Steig",version_update:"Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",no_entities_picked:"Keine Haltestelle ausgewählt",no_entities_available:"Keine Wiener-Linien-Sensoren gefunden",departures_list:"Kommende Abfahrten",barrier_free_title:"Barrierefrei zugänglich",disturbance_title:"Verkehrsbehinderung gemeldet",stops_ahead_aria_show:"Streckenverlauf für {line} Richtung {towards} anzeigen",stops_ahead_aria_hide:"Streckenverlauf für {line} Richtung {towards} ausblenden",stops_ahead_transfer_aria:"Umsteigen auf {lines}",stops_ahead_other_show:"{count} weitere Linien bei {stop} anzeigen",stops_ahead_other_hide:"Weitere Linien bei {stop} ausblenden",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",dir_both:"Beide",traffic_label:"Störung",traffic_until:"Bis",traffic_updated:"aktualisiert",elevator_label:"Aufzug außer Betrieb",elevator_until:"Bis",open_in_maps:"In Karte öffnen",qr_open:"QR-Code anzeigen",qr_dialog_title:"QR-Code für Haltestelle",qr_dialog_hint:"Mit dem Smartphone scannen — öffnet die Haltestelle in der Karten-App.",delay_singular:"1 Min. verspätet",delay_plural:"{n} Min. verspätet",devmode_title:"DEV",devmode_traffic_btn:"Test Störung",devmode_elevator_btn:"Test Aufzug",devmode_clear_btn:"Löschen",editor:{lines_label:"Linien",direction_label:"Richtung",per_line_direction_label:"Richtung pro Linie",per_line_direction_hint:"Optional: Richtung pro Linie einzeln festlegen. Beide = haltestellenweite Richtung oben verwenden.",per_line_direction_aria:"Richtung für Linie {line}",direction_unavailable:"Keine Abfahrten in dieser Richtung",walk_time_label:"Fußweg (min)",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis du dort bist. Leer lassen = kein Filter.",walk_time_branching_hint:"Gilt für alle Endstationen in dieser Richtung",walk_time_placeholder:"–",walk_time_aria:"Fußweg in Minuten für Linie {line} Richtung {towards}",section_colors:"Linienfarben",colors_hint:"Optional: Farben überschreiben. U-Bahn-Standardwerte sind gesetzt.",reset_color:"Zurücksetzen",pick_color_for_line:"Farbe für Linie {line} wählen",section_display:"Anzeige",max_departures:"Anzahl Abfahrten pro Haltestelle",show_accessibility:"Barrierefrei-Symbol anzeigen",accessibility_only:"Nur barrierefreie Abfahrten anzeigen",show_type_icon:"Verkehrsmittel-Symbol anzeigen",show_platform:"Steig/Gleis anzeigen",show_traffic_info:"Störungen anzeigen",show_elevator_info:"Aufzugsinfo anzeigen",show_delay:"Verspätungen anzeigen",show_hero_metric:"Hauptbereich anzeigen",show_departures:"Abfahrtsliste anzeigen",show_stops_ahead:"Zwischenstopps anzeigen",show_qr_button:"QR-Code-Button anzeigen",hide_header:"Kopfzeile ausblenden",hide_attribution:"Datenquelle ausblenden",layout:"Layout mehrerer Haltestellen",layout_stacked:"Gestapelt",layout_tabs:"Reiter",no_lines_available:"Linien erscheinen hier, sobald Haltestellen ausgewählt wurden."}},Te={no_entity:"Keine Haltestelle ausgewählt",no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",betriebsschluss:"Betriebsschluss",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",gleis:"GLEIS",steig:"STEIG",version_update:"Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",departures_list:"Kommende Abfahrten",at_platform:"Einfahrt",countdown_minutes:"{n} Minuten",race_finished:"Barrierefreiheits-Rennen beendet",race_starting_in:"Rennen startet in {n}",race_winner_announce:"Rollstuhl {n} gewinnt das Barrierefreiheits-Rennen",barrier_free_title:"Barrierefrei zugänglich",editor:{direction:"Richtung",line:"Linie",size:"Größe",style:"Stil",station_bg:"Hintergrund",section_display:"Darstellung",section_walk_time:"Fußweg zur Haltestelle",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis du dort bist. Leer lassen = kein Filter.",walk_time_branching_hint:"Gilt für alle Endstationen in dieser Richtung",walk_time_no_data:"Keine Abfahrten in dieser Richtung. Richtung wechseln oder warten, bis der Sensor Linien meldet.",walk_time_placeholder:"–",walk_time_aria:"Fußweg in Minuten für Linie {line} Richtung {towards}",show_platform:"Gleis/Steig anzeigen",show_station_name:"Stationsnamen anzeigen",section_station:"Stationsnamen-Schild",station_bg_default:"Standard",station_bg_white:"Weiß",station_bg_black:"Schwarz",size_small:"Klein",size_medium:"Mittel",size_regular:"Normal",style_classic:"Klassisch",style_warm:"Warm",style_pixel:"Punktmatrix",accessibility_only:"Nur barrierefreie Abfahrten anzeigen",flicker:"Linien-Flimmern",wheelchair_race:"Rollstuhl-Rennen"}},Ce={modern:Ee,retro:Te},Me={no_data:"No departures available",betriebsschluss:"End of service",min:"min",now:"Now",platform_short_rail:"Track",platform_short_bus:"Bay",version_update:"Wiener Linien Austria updated to v{v} — please reload",version_reload:"Reload",no_entities_picked:"No stop selected",no_entities_available:"No Wiener Linien sensors found",departures_list:"Upcoming departures",barrier_free_title:"Step-free access",disturbance_title:"Traffic disruption reported",stops_ahead_aria_show:"Show stops ahead for {line} towards {towards}",stops_ahead_aria_hide:"Hide stops ahead for {line} towards {towards}",stops_ahead_transfer_aria:"Change to {lines}",stops_ahead_other_show:"Show {count} more lines at {stop}",stops_ahead_other_hide:"Hide other lines at {stop}",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",dir_both:"Both",traffic_label:"Disruption",traffic_until:"Until",traffic_updated:"updated",elevator_label:"Elevator out of service",elevator_until:"Until",open_in_maps:"Open in maps",qr_open:"Show QR code",qr_dialog_title:"QR code for stop",qr_dialog_hint:"Scan with your phone — opens the stop in your maps app.",delay_singular:"1 min. late",delay_plural:"{n} min. late",devmode_title:"DEV",devmode_traffic_btn:"Test disruption",devmode_elevator_btn:"Test elevator",devmode_clear_btn:"Clear",editor:{lines_label:"Lines",direction_label:"Direction",per_line_direction_label:"Per-line direction",per_line_direction_hint:"Optional: pick the direction for each line individually. Both = use the stop-wide direction above.",per_line_direction_aria:"Direction for line {line}",direction_unavailable:"No departures in this direction",walk_time_label:"Walking time (min)",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_branching_hint:"Applies to all termini in this direction",walk_time_placeholder:"–",walk_time_aria:"Walk time in minutes for line {line} towards {towards}",section_colors:"Line colours",colors_hint:"Optional overrides. Metro defaults are already set.",reset_color:"Reset",pick_color_for_line:"Pick colour for line {line}",section_display:"Display",max_departures:"Departures per stop",show_accessibility:"Show step-free icon",accessibility_only:"Only show step-free departures",show_type_icon:"Show vehicle-type icon",show_platform:"Show platform / track",show_traffic_info:"Show disruption alerts",show_elevator_info:"Show elevator outages",show_delay:"Show delays",show_hero_metric:"Show hero block",show_departures:"Show departure list",show_stops_ahead:"Show intermediate stops",show_qr_button:"Show QR-code button",hide_header:"Hide header",hide_attribution:"Hide data source",layout:"Multi-stop layout",layout_stacked:"Stacked",layout_tabs:"Tabs",no_lines_available:"Lines appear here once stops are selected."}},He={no_entity:"No stop selected",no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",betriebsschluss:"End of service",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",gleis:"PLATF.",steig:"STAND",version_update:"Retro card updated to v{v} — please reload",version_reload:"Reload",departures_list:"Upcoming departures",at_platform:"At platform",countdown_minutes:"{n} minutes",race_finished:"Accessibility race finished",race_starting_in:"Race starting in {n}",race_winner_announce:"Wheelchair {n} wins the accessibility race",barrier_free_title:"Step-free access",editor:{direction:"Direction",line:"Line",size:"Size",style:"Style",station_bg:"Station-name background",section_display:"Display",section_walk_time:"Walking time to stop",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_branching_hint:"Applies to all termini in this direction",walk_time_no_data:"No departures in this direction. Switch direction or wait until the sensor reports lines.",walk_time_placeholder:"–",walk_time_aria:"Walk time in minutes for line {line} towards {towards}",show_platform:"Show platform",show_station_name:"Show station name",section_station:"Station name sign",station_bg_default:"Default",station_bg_white:"White",station_bg_black:"Black",size_small:"Small",size_medium:"Medium",size_regular:"Regular",style_classic:"Classic",style_warm:"Warm",style_pixel:"Dot matrix",accessibility_only:"Only show step-free departures",flicker:"Line badge flicker",wheelchair_race:"Wheelchair race"}},Re={modern:Me,retro:He};const Le={de:Object.freeze({__proto__:null,default:Ce,modern:Ee,retro:Te}),en:Object.freeze({__proto__:null,default:Re,modern:Me,retro:He})},Pe=Le.de??{};function De(e,t){const i=function(e,t){return e.split(".").reduce((e,t)=>{if(e&&"object"==typeof e&&t in e)return e[t]},t)}(e,t);return"string"==typeof i?i:void 0}function Oe(e,t,i){const r=function(e){return"en"===((e.configLanguage||e.hassLanguage||"de").replace("-","_").split("_")[0]??"de")?"en":"de"}(t);let n=De(e,Le[r]??Pe);if(void 0===n&&(n=De(e,Pe)),void 0===n)return e;if(i)for(const[e,t]of Object.entries(i))n=n.replace(`{${e}}`,String(t));return n}function Ne(){try{window.caches?.keys?.().then(e=>{e.forEach(e=>window.caches?.delete?.(e))})}catch{}window.location.reload()}function Ue(e,t,i="banner"){if(!e)return I;const r=t("version_update").replace("{v}",e),n=t("version_reload");return B`
    <div class=${i} role="alert" aria-live="assertive">
      <span>${r}</span>
      <button
        type="button"
        aria-label=${n}
        @click=${Ne}
      >
        ${n}
      </button>
    </div>
  `}function qe(e,t){return e?B`<span lang="de">${e}</span>`:t??""}const je="ptMetro";function Fe(e){switch(e){case je:return"mdi:subway-variant";case"ptTram":return"mdi:tram";case"ptBusCity":case"ptBusNight":return"mdi:bus";default:return null}}function Be(e){if("string"==typeof e)return e.startsWith("sensor.")?{entity:e}:null;if(!e||"object"!=typeof e)return null;const t=e,i="string"==typeof t.entity?t.entity:null;if(!i?.startsWith("sensor."))return null;const r={entity:i};if(Array.isArray(t.lines)){const e=t.lines.filter(e=>"string"==typeof e&&e.length>0);e.length&&(r.lines=e)}"H"!==t.direction&&"R"!==t.direction||(r.direction=t.direction);const n=function(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,r]of Object.entries(e))"string"==typeof i&&i.length&&("H"!==r&&"R"!==r||(t[i]=r));return Object.keys(t).length?t:void 0}(t.line_directions);n&&(r.line_directions=n);const a=function(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,r]of Object.entries(e)){const e="number"==typeof r?r:"string"==typeof r?Number(r):NaN;if(!Number.isFinite(e))continue;if(e<0||e>120)continue;const n=i.split("|"),a=n.length>=3?`${n[0]}|${n[1]}`:i,o=Math.round(e),s=t[a];t[a]=void 0===s?o:Math.max(s,o)}return Object.keys(t).length?t:void 0}(t.walk_times);return a&&(r.walk_times=a),r}const Ve=6,Ie=!1,We=!1,Ke=!0,Ge=!0,Qe=!0,Ze=!1,Je=!0,Ye=!0,Xe=!0,et=!0,tt=!0,it=!1,rt=!1;function nt(e){let t=[];Array.isArray(e.entities)?t=e.entities:"string"==typeof e.entity&&(t=[{entity:e.entity,lines:e.lines,direction:e.direction,walk_times:e.walk_times}]);const i=[],r=new Set;for(const e of t){const t=Be(e);t&&(r.has(t.entity)||(r.add(t.entity),i.push(t)))}const n=Number(e.max_departures),a=Number.isFinite(n)?Math.max(0,Math.min(20,Math.round(n))):Ve,o={};if(e.line_colors&&"object"==typeof e.line_colors)for(const[t,i]of Object.entries(e.line_colors))"string"==typeof i&&/^#[0-9A-Fa-f]{3,8}$/.test(i.trim())&&(o[t.toUpperCase()]=i.trim());return{...e,type:e.type||"custom:wiener-linien-austria-card",entities:i,max_departures:a,line_colors:o,show_accessibility:e.show_accessibility??Ie,accessibility_only:e.accessibility_only??We,show_traffic_info:e.show_traffic_info??Ke,show_elevator_info:e.show_elevator_info??Ge,show_delay:e.show_delay??Qe,show_type_icon:e.show_type_icon??Ze,show_platform:e.show_platform??Je,show_hero_metric:e.show_hero_metric??Ye,show_departures:e.show_departures??Xe,show_stops_ahead:e.show_stops_ahead??et,show_qr_button:e.show_qr_button??tt,hide_header:e.hide_header??it,hide_attribution:e.hide_attribution??rt,layout:"tabs"===e.layout?"tabs":"stacked"}}function at(e,t,i={},r="var(--primary-color)"){const n=e.toUpperCase();if(void 0!==t[n])return{background:t[n]};if(/^N\d/.test(n))return{background:"#1b1464",color:"#fef200"};const a=i[e]??i[n];return a?.bg?a.fg?{background:`#${a.bg}`,color:`#${a.fg}`}:{background:`#${a.bg}`}:{background:r}}function ot(e,t,i={},r="var(--primary-color)"){return at(e,t,i,r).background}function st(e){if(!e)return[];const t=[];for(const[i,r]of Object.entries(e.states??{})){if(!i.startsWith("sensor."))continue;const e=r?.attributes??{};"number"==typeof e.diva&&(Array.isArray(e.departures)&&e.next_by_line&&"object"==typeof e.next_by_line&&t.push(i))}return t.sort(),t}function lt(e,t){if(!e)return{};for(const i of t){const t=e.states?.[i]?.attributes,r=t?.line_colors;if(r&&Object.keys(r).length)return r}return{}}function dt(e,t,i){return`${e}|${t}|${i}`}function ct(e,t){return`${e}|${t}`}function ht(e,t){if(!e.length)return t.full;const i=e.slice(0,3).join(" / "),r=e.length>3?" +"+(e.length-3):"";return`${t.short}: ${i}${r}`}function pt(e){if(e?.tracked_lines?.length)return[...e.tracked_lines].sort();const t=new Set;if(e?.lines_at_stop?.length)for(const i of e.lines_at_stop)t.add(i);for(const i of e?.departures??[])i.line&&t.add(i.line);return Array.from(t).sort()}function ut(e,t){return!1!==e&&Array.isArray(t.stops_ahead)&&t.stops_ahead.length>0}function ft(e){return function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}(e).replace(/&lt;br\s*\/?&gt;/gi,"<br>")}function _t(e,t="de"){if(!e)return"";const i=Date.parse(e);if(!Number.isFinite(i))return e;try{return new Date(i).toLocaleString("en"===t?"en-GB":"de-AT",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"})}catch{return e}}const gt=o`
  :host {
    display: block;
  }
  .editor {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .editor-section {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
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
    background: var(--primary-color);
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
`;
// Schema-driven Lovelace editor for the Wiener Linien Austria modern card.
let mt=class extends se{constructor(){super(...arguments),this._computeLabel=e=>{const t=`ui.panel.lovelace.editor.card.generic.${e.name}`,i=this.hass?.localize?.(t);if(i)return i;const r=this._et(e.name);return r!==`modern.editor.${e.name}`&&r!==e.name?r:e.name},this._computeHelper=e=>{const t=`${e.name}_helper`,i=this._et(t);if(i!==`modern.editor.${t}`&&i!==t)return i},this._onFormChanged=e=>{if(!this._config)return;const t=e.detail.value,i=t.entities,r=Array.isArray(i)?i.filter(e=>"string"==typeof e&&e.length>0):[],n=new Map;for(const e of this._config.entities)n.set(e.entity,e);const a=r.map(e=>n.get(e)??{entity:e}),o=nt({...this._config,...t,entities:a});this._fire(o)}}setConfig(e){this._config=nt(e)}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._config.entities.map(e=>e.entity);return i.some(e=>t.states[e]!==this.hass.states[e])}_et(e){return Oe(`modern.editor.${e}`,{hassLanguage:this.hass?.language})}_t(e){return Oe(`modern.${e}`,{hassLanguage:this.hass?.language})}_fire(e){var t,i;this._config=e,t="config-changed",i={config:e},this.dispatchEvent(new CustomEvent(t,{detail:i,bubbles:!0,composed:!0}))}_schema(){return[{name:"entities",required:!0,selector:{entity:{domain:"sensor",integration:"wiener_linien_austria",multiple:!0}}},{name:"layout",selector:{select:{mode:"dropdown",options:[{value:"stacked",label:this._et("layout_stacked")},{value:"tabs",label:this._et("layout_tabs")}]}}},{type:"expandable",name:"display",title:this._et("section_display"),flatten:!0,schema:[{name:"max_departures",selector:{number:{min:0,max:20,step:1,mode:"slider"}}},{name:"hide_header",selector:{boolean:{}}},{name:"show_hero_metric",selector:{boolean:{}}},{name:"show_departures",selector:{boolean:{}}},{name:"show_stops_ahead",selector:{boolean:{}}},{name:"show_qr_button",selector:{boolean:{}}},{name:"show_platform",selector:{boolean:{}}},{name:"show_accessibility",selector:{boolean:{}}},{name:"accessibility_only",selector:{boolean:{}}},{name:"show_type_icon",selector:{boolean:{}}},{name:"show_traffic_info",selector:{boolean:{}}},{name:"show_elevator_info",selector:{boolean:{}}},{name:"show_delay",selector:{boolean:{}}},{name:"hide_attribution",selector:{boolean:{}}}]}]}_formData(){if(!this._config)return{};const e=this._config.entities.map(e=>e.entity);return{...this._config,entities:e}}_updateStop(e,t){if(!this._config)return;const i=this._config.entities.map(i=>i.entity===e?t({...i}):i);this._fire({...this._config,entities:i})}_toggleLine(e,t){this._updateStop(e,e=>{const i=new Set(e.lines??[]);return i.has(t)?i.delete(t):i.add(t),i.size>0?e.lines=[...i]:delete e.lines,e})}_setDirection(e,t){this._updateStop(e,e=>(null===t?delete e.direction:e.direction=t,e))}_setLineDirection(e,t,i){this._updateStop(e,e=>{const r={...e.line_directions??{}};return null===i?delete r[t]:r[t]=i,Object.keys(r).length?e.line_directions=r:delete e.line_directions,e})}_setWalkTime(e,t,i){const r=parseInt(i,10),n=Number.isFinite(r)&&r>0?Math.min(120,r):null;this._updateStop(e,e=>{const i={...e.walk_times??{}};return null===n?delete i[t]:i[t]=n,Object.keys(i).length?e.walk_times=i:delete e.walk_times,e})}_setLineColor(e,t){if(!this._config)return;const i={...this._config.line_colors,[e.toUpperCase()]:t};this._fire({...this._config,line_colors:i})}_resetLineColor(e){if(!this._config)return;const t={...this._config.line_colors};delete t[e.toUpperCase()],this._fire({...this._config,line_colors:t})}_swallowKeys(e){e.stopPropagation()}_attrs(e){return this.hass?.states?.[e]?.attributes}render(){return this._config?B`
      <div class="editor">
        <ha-form
          .hass=${this.hass}
          .data=${this._formData()}
          .schema=${this._schema()}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${this._onFormChanged}
        ></ha-form>
        ${this._renderPerStopSections()}
        ${this._renderColorsSection()}
      </div>
    `:I}_renderPerStopSections(){const e=this._config;return e.entities.length?B`${e.entities.map(e=>this._renderStopFilter(e))}`:I}_dirPillStrings(e){return{full:this._t("H"===e?"dir_h":"dir_r"),short:this._t("H"===e?"dir_h_short":"dir_r_short")}}_stopWideDirectionLabel(e,t){const i=new Set;for(const r of e)r.direction===t&&r.towards&&i.add(r.towards);return ht([...i].sort(),this._dirPillStrings(t))}_perLineDirectionLabel(e,t,i){const r=new Set;for(const n of e)n.line===t&&n.direction===i&&n.towards&&r.add(n.towards);return ht([...r].sort(),this._dirPillStrings(i))}_renderStopFilter(e){const t=this._attrs(e.entity);if(!t)return B``;const i=t.stop_name||e.entity,r=this._config.line_colors,n=t.line_colors??{},a=pt(t),o=new Map;for(const e of t.departures??[])e.line&&e.type&&!o.has(e.line)&&o.set(e.line,e.type);const s=new Set(e.lines??[]),l=e.direction??null,d=e.line_directions??{},c=s.size>0?a.filter(e=>s.has(e)):a,h=c.length>=2,p=function(e){const t=[],i=new Set;for(const r of e?.departures??[]){const e=dt(r.line,String(r.direction??""),r.towards);i.has(e)||(i.add(e),t.push({line:r.line,direction:String(r.direction??""),towards:r.towards,type:r.type}))}return t.sort((e,t)=>e.line===t.line?e.towards.localeCompare(t.towards):e.line.localeCompare(t.line)),t}(t),u=p.filter(e=>{if(s.size>0&&!s.has(e.line))return!1;const t=d[e.line]??l;return!t||e.direction===t}),f=new Set;for(const e of p)"H"!==e.direction&&"R"!==e.direction||f.add(e.direction);const _=f.has("H"),g=f.has("R"),m=1===f.size,b="H"===l||null===l&&m&&_,v="R"===l||null===l&&m&&g,w=null===l&&!m;return B`
      <div class="stop-filter">
        <div class="stop-filter-header">${i}</div>

        <div class="stop-filter-row">
          <div class="stop-filter-row-label">${this._et("lines_label")}</div>
          <div class="line-chips">
            ${a.length?a.map(t=>{const i=0===s.size||s.has(t),a=ot(t,r,n),l=Fe(o.get(t))??"mdi:bus-stop";return B`<button
                    type="button"
                    class=${we({chip:!0,selected:i})}
                    style=${$e({"--chip-color":a})}
                    aria-pressed=${i?"true":"false"}
                    aria-label="${this._et("lines_label")}: ${t}"
                    @click=${()=>this._toggleLine(e.entity,t)}
                  >
                    <ha-icon icon=${l} aria-hidden="true"></ha-icon>
                    <span>${t}</span>
                  </button>`}):B`<div class="editor-hint">${this._et("no_lines_available")}</div>`}
          </div>
        </div>

        <div class="stop-filter-row">
          <div class="stop-filter-row-label">${this._et("direction_label")}</div>
          <div class="direction-buttons">
            <button
              type="button"
              class=${we({active:b})}
              ?disabled=${!_}
              title=${_?"":this._et("direction_unavailable")}
              @click=${()=>_&&this._setDirection(e.entity,"H")}
            >${this._stopWideDirectionLabel(p,"H")}</button>
            <button
              type="button"
              class=${we({active:v})}
              ?disabled=${!g}
              title=${g?"":this._et("direction_unavailable")}
              @click=${()=>g&&this._setDirection(e.entity,"R")}
            >${this._stopWideDirectionLabel(p,"R")}</button>
            <button
              type="button"
              class=${we({active:w})}
              ?disabled=${m}
              title=${m?this._et("direction_unavailable"):""}
              @click=${()=>!m&&this._setDirection(e.entity,null)}
            >${this._t("dir_both")}</button>
          </div>
        </div>

        ${h?B`
              <div class="stop-filter-row">
                <div class="stop-filter-row-label">${this._et("per_line_direction_label")}</div>
                <div class="editor-hint">${this._et("per_line_direction_hint")}</div>
                <div class="per-line-dir-list">
                  ${c.map(t=>{const i=ot(t,r,n),a=d[t]??null,o=(e=>{const t=new Set;for(const i of p)i.line===e&&("H"!==i.direction&&"R"!==i.direction||t.add(i.direction));return t})(t),s=o.has("H"),l=o.has("R"),c=1===o.size,h="H"===a||null===a&&c&&s,u="R"===a||null===a&&c&&l,f=null===a&&!c,_=this._et("per_line_direction_aria").replace("{line}",t),g=this._et("direction_unavailable"),m=e=>this._perLineDirectionLabel(p,t,e);return B`
                      <div class="per-line-dir-row" role="group" aria-label=${_}>
                        <span class="per-line-dir-badge" style=${$e({background:i})}>${t}</span>
                        <div class="direction-buttons">
                          <button
                            type="button"
                            class=${we({active:h})}
                            aria-pressed=${h?"true":"false"}
                            ?disabled=${!s}
                            title=${s?"":g}
                            @click=${()=>s&&this._setLineDirection(e.entity,t,"H")}
                          >${m("H")}</button>
                          <button
                            type="button"
                            class=${we({active:u})}
                            aria-pressed=${u?"true":"false"}
                            ?disabled=${!l}
                            title=${l?"":g}
                            @click=${()=>l&&this._setLineDirection(e.entity,t,"R")}
                          >${m("R")}</button>
                          <button
                            type="button"
                            class=${we({active:f})}
                            aria-pressed=${f?"true":"false"}
                            ?disabled=${c}
                            title=${c?g:""}
                            @click=${()=>!c&&this._setLineDirection(e.entity,t,null)}
                          >${this._t("dir_both")}</button>
                        </div>
                      </div>
                    `})}
                </div>
              </div>
            `:I}

        ${this._renderWalkTimes(e,u,l,d)}
      </div>
    `}_renderWalkTimes(e,t,i,r){const n=this._config.line_colors,a=this._attrs(e.entity),o=a?.line_colors??{},s=function(e){const t=new Map;for(const i of e?.departures??[]){const e=String(i.direction??""),r=ct(i.line,e);let n=t.get(r);n||(n={line:i.line,direction:e,type:i.type,termini:[]},t.set(r,n)),i.towards&&!n.termini.includes(i.towards)&&n.termini.push(i.towards)}const i=Array.from(t.values());return i.sort((e,t)=>e.line===t.line?e.direction.localeCompare(t.direction):e.line.localeCompare(t.line)),i}(a),l=new Set(e.lines??[]),d=s.filter(e=>{if(l.size>0&&!l.has(e.line))return!1;const t=r[e.line]??i;return!t||e.direction===t});return d.length?B`
      <div class="stop-filter-row">
        <div class="stop-filter-row-label">${this._et("walk_time_label")}</div>
        <div class="editor-hint">${this._et("walk_time_hint")}</div>
        <div class="walk-time-list">
          ${d.map(t=>{const i=ot(t.line,n,o),r=ct(t.line,t.direction),a=e.walk_times?.[r],s=t.termini.join(" / "),l=s?`→ ${s}`:"",d=t.termini.length>1?this._et("walk_time_branching_hint"):"";return B`
              <div class="walk-time-row">
                <span class="walk-time-badge" style=${$e({background:i})}>${t.line}</span>
                <span class="walk-time-towards" title=${d||s}>${l}</span>
                <input
                  type="number"
                  class="walk-time-input"
                  min="0"
                  max="120"
                  step="1"
                  inputmode="numeric"
                  placeholder=${this._et("walk_time_placeholder")}
                  aria-label=${this._et("walk_time_aria").replace("{line}",t.line).replace("{towards}",s)}
                  .value=${void 0!==a?String(a):""}
                  @keydown=${this._swallowKeys}
                  @keyup=${this._swallowKeys}
                  @keypress=${this._swallowKeys}
                  @change=${t=>this._setWalkTime(e.entity,r,t.target.value)}
                />
              </div>
            `})}
        </div>
      </div>
    `:I}_renderColorsSection(){const e=this._config,t=function(e,t){const i=new Set;for(const r of t){const t=e?.states?.[r]?.attributes;for(const e of pt(t))i.add(e)}return Array.from(i).sort()}(this.hass,e.entities.map(e=>e.entity)),i=e.line_colors,r=lt(this.hass,e.entities.map(e=>e.entity));return B`
      <div class="editor-section">
        <div class="section-header">${this._et("section_colors")}</div>
        <div class="editor-hint">${this._et("colors_hint")}</div>
        ${t.length?t.map(e=>{const t=ot(e,i,r,"#888888"),n=t.startsWith("#")?t:"#888888",a=Boolean(i[e.toUpperCase()]),o=this._et("pick_color_for_line").replace("{line}",e);return B`
                <div class="color-row">
                  <span class="line-preview" aria-hidden="true" style=${$e({background:t})}>${e}</span>
                  <label
                    class="color-swatch"
                    style=${`--swatch-color: ${n};`}
                    title=${o}
                  >
                    <ha-icon icon="mdi:palette-swatch-variant" aria-hidden="true"></ha-icon>
                    <span class="color-swatch-hex">${n.toUpperCase()}</span>
                    <input
                      type="color"
                      class="color-swatch-input"
                      .value=${n}
                      aria-label=${o}
                      @input=${t=>this._setLineColor(e,t.target.value)}
                      @change=${t=>this._setLineColor(e,t.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    class="reset-btn"
                    ?disabled=${!a}
                    @click=${()=>a&&this._resetLineColor(e)}
                  >${this._et("reset_color")}</button>
                </div>
              `}):B`<div class="editor-hint">${this._et("no_lines_available")}</div>`}
      </div>
    `}static{this.styles=[gt,o`
    .stop-filter {
      background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .stop-filter-header {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .stop-filter-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .stop-filter-row-label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .line-chips,
    .per-line-dir-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .per-line-dir-list {
      flex-direction: column;
      gap: 4px;
    }
    .per-line-dir-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .per-line-dir-badge {
      min-width: 36px;
      text-align: center;
      font-weight: 700;
      color: #fff;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 0.8125rem;
    }
    /* Line chip — outlined-by-default, filled-when-selected, with the
       MoT icon beside the line label. Mirrors linz-linien's chip
       pattern: --chip-color is set inline per line (GTFS palette →
       colorForLine), the CSS does state via .selected + the
       color-mix hover tint. */
    .chip {
      --chip-color: var(--primary-color);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      min-height: 32px;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.8125rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      cursor: pointer;
      transition:
        background-color var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease),
        color var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease);
      border: 1.5px solid var(--chip-color);
      background: transparent;
      color: var(--primary-text-color);
      forced-color-adjust: none;
    }
    .chip ha-icon {
      --mdc-icon-size: 16px;
      color: var(--chip-color);
      flex-shrink: 0;
      transition: color var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease);
    }
    .chip:hover {
      background: color-mix(in srgb, var(--chip-color) 16%, transparent);
    }
    .chip.selected {
      background: var(--chip-color);
      color: #fff;
    }
    .chip.selected ha-icon {
      color: #fff;
    }
    .chip:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    .direction-buttons {
      display: inline-flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .direction-buttons button {
      padding: 8px 14px;
      border-radius: 18px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 0.8125rem;
      cursor: pointer;
      min-width: 44px;
      min-height: 36px;
    }
    .direction-buttons button.active {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color);
    }
    .direction-buttons button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    /* walk-time rules live in editor-shared-styles. The modern editor
       styles its badge bg per-line via styleMap (vs the shared default
       var(--primary-color)), but the box-model rules are identical. */
    .color-row {
      display: grid;
      grid-template-columns: 60px 1fr auto;
      align-items: center;
      gap: 12px;
      margin-top: 6px;
    }
    .line-preview {
      text-align: center;
      font-weight: 700;
      color: #fff;
      border-radius: 6px;
      padding: 4px 6px;
      font-size: 0.8125rem;
    }
    .color-swatch {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, #fff);
      cursor: pointer;
    }
    .color-swatch::before {
      content: "";
      width: 16px;
      height: 16px;
      border-radius: 4px;
      background: var(--swatch-color, #888888);
    }
    .color-swatch-hex {
      font-size: 0.75rem;
      font-variant-numeric: tabular-nums;
      color: var(--secondary-text-color);
    }
    .color-swatch-input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }
    .reset-btn {
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid var(--divider-color);
      background: transparent;
      color: var(--primary-text-color);
      font-size: 0.75rem;
      cursor: pointer;
    }
    .reset-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `]}};e([pe({attribute:!1})],mt.prototype,"hass",void 0),e([ue()],mt.prototype,"_config",void 0),mt=e([de("wiener-linien-austria-card-editor")],mt);{const e=window;e.customCards=e.customCards??[],e.customCards.some(e=>"wiener-linien-austria-card"===e.type)||e.customCards.push({type:"wiener-linien-austria-card",name:"Wiener Linien Austria",description:"Abfahrtsmonitor mit Störungen und Aufzugsinfo",preview:!0})}function bt(e){return e===je?"platform_short_rail":"platform_short_bus"}const vt=new Map;function wt(e,t){if(!e||!t)return{};const i=e.states[t]?.attributes;return i?.line_colors??{}}let yt=class extends se{constructor(){super(...arguments),this._activeTab=0,this._versionMismatch=null,this._expandedTraffic=new Set,this._expandedElevator=new Set,this._expandedRows=new Set,this._expandedTransfers=new Set,this._debugTraffic=[],this._debugElevator=[],this._qrOpenFor=null,this._versionCheckDone=!1,this._fallbackWarned=!1,this._devTestTraffic=()=>{const e=this._resolveStops(),t=[];for(const i of e)for(const e of this._attrs(i.entity).departures??[])e.line&&e.towards&&t.push(e);const i=this._randomFrom(t),r=i?.line||"U?",n=i?.towards||"Unbekannt",a=new Date;this._debugTraffic=[...this._debugTraffic,{name:`DEBUG-T-${Date.now()}`,title:`${r}: Testmeldung`,description:`Debug-Eintrag für Linie ${r} Richtung ${n}.`,description_html:`Debug-Eintrag für Linie ${r} Richtung ${n}.<br><br>Grund: Dev-Mode-Test.`,location:"Debug-Stelle",related_lines:[r],time_start:new Date(a.getTime()-18e5).toISOString(),time_end:new Date(a.getTime()+108e5).toISOString(),time_created:new Date(a.getTime()-18e5).toISOString(),time_last_update:a.toISOString(),status:"active"}]},this._devTestElevator=()=>{const e=this._resolveStops(),t=this._randomFrom(e);if(!t)return;const i=this._attrs(t.entity),r=i.stop_name||t.entity,n=i.departures??[],a=this._randomFrom(n)?.line||"",o=this._randomFrom(n)?.towards||"Unbekannt",s=new Date;this._debugElevator=[...this._debugElevator,{__debug_entity:t.entity,name:`DEBUG-E-${Date.now()}`,station:r,description:`${a||"Station"} Bahnsteig Richtung ${o} — Ausgang ${r}`,reason:"AUFZUGSERNEUERUNG Voraussichtlich bis Ende Mai außer Betrieb! (Dev-Mode-Test)",status:"außer Betrieb",related_lines:a?[a]:[],time_start:new Date(s.getTime()-27e5).toISOString(),time_end:new Date(s.getTime()+144e5).toISOString()}]},this._devClear=()=>{this._debugTraffic=[],this._debugElevator=[]}}setConfig(e){if(!e||"object"!=typeof e)throw new Error("wiener-linien-austria-card: config must be an object");const t=Array.isArray(e.entities),i="string"==typeof e.entity;if(!t&&!i)throw new Error("wiener-linien-austria-card: 'entities' (array) or legacy 'entity' (string) is required");this._config=nt(e)}getCardSize(){const e=this._config?.entities.length??1;return Math.min(12,3+3*e)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:3}}static getConfigElement(){return document.createElement("wiener-linien-austria-card-editor")}static getStubConfig(e){const t=st(e);return{entities:t.length?[t[0]]:[],max_departures:6}}connectedCallback(){super.connectedCallback(),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion())}willUpdate(e){if(this._config&&(e.has("_config")||e.has("hass"))){const e=this._resolveStops();if(e.length&&this._activeTab>=e.length&&(this._activeTab=0),this._qrOpenFor){const t=new Set(e.map(e=>e.entity));t.has(this._qrOpenFor)||(this._qrOpenFor=null)}}}updated(e){if(!this._qrOpenFor)return;const t=this.renderRoot.querySelector(".qr-panel.expanded .qr-canvas");if(!t)return;const i=t.getAttribute("data-qr-text")??"",r=t.getAttribute("data-qr-rendered-for")??"";i&&i!==r&&(this._renderTintedQr(t),t.setAttribute("data-qr-rendered-for",i))}_renderTintedQr(e){const t=e.closest(".station"),i=t&&getComputedStyle(t).getPropertyValue("--wl-accent").trim()||"#000";for(;e.firstChild;)e.removeChild(e.firstChild);Se.render({text:e.getAttribute("data-qr-text")??"",radius:0,ecLevel:"H",fill:i,background:"#fff",size:220},e);const r=e.querySelector("canvas");if(!(r instanceof HTMLCanvasElement))return;const n=r.getContext("2d");if(!n)return;const a=e.getAttribute("data-qr-icon")??"mdi:bus-stop",o=this._mdiPathFor(a);if(!o)return;const s=r.width,l=r.height,d=Math.round(.22*s),c=Math.round((s-d)/2),h=Math.round((l-d)/2),p=Math.round(.18*d),u=c-p,f=h-p,_=d+2*p,g=Math.round(.2*d);n.fillStyle="#fff","function"==typeof n.roundRect?(n.beginPath(),n.roundRect(u,f,_,_,g),n.fill()):n.fillRect(u,f,_,_),n.save(),n.translate(c,h),n.scale(d/24,d/24),n.fillStyle=i,n.fill(new Path2D(o)),n.restore()}_mdiPathFor(e){switch(e){case"mdi:subway-variant":return"M18,11H13V6H18M16.5,17A1.5,1.5 0 0,1 15,15.5A1.5,1.5 0 0,1 16.5,14A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 16.5,17M11,11H6V6H11M7.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,14A1.5,1.5 0 0,1 9,15.5A1.5,1.5 0 0,1 7.5,17M12,2C7.58,2 4,2.5 4,6V15.5A3.5,3.5 0 0,0 7.5,19L6,20.5V21H18V20.5L16.5,19A3.5,3.5 0 0,0 20,15.5V6C20,2.5 16.42,2 12,2Z";case"mdi:tram":return"M19,16.94V8.5C19,5.71 16.39,5.1 13,5L13.75,3.5H17V2H7V3.5H11.75L11,5C7.86,5.11 5,5.73 5,8.5V16.94C5,18.39 6.19,19.6 7.59,19.91L6,21.5V22H8.23L10.23,20H14L16,22H18V21.5L16.5,20H16.42C18.11,20 19,18.63 19,16.94M12,18.5A1.5,1.5 0 0,1 10.5,17A1.5,1.5 0 0,1 12,15.5A1.5,1.5 0 0,1 13.5,17A1.5,1.5 0 0,1 12,18.5M17,14H7V9H17V14Z";case"mdi:bus":return"M18,11H6V6H18M16.5,17A1.5,1.5 0 0,1 15,15.5A1.5,1.5 0 0,1 16.5,14A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 16.5,17M7.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,14A1.5,1.5 0 0,1 9,15.5A1.5,1.5 0 0,1 7.5,17M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16Z";default:return"M22 7V16C22 16.71 21.62 17.36 21 17.72V19.25C21 19.66 20.66 20 20.25 20H19.75C19.34 20 19 19.66 19 19.25V18H12V19.25C12 19.66 11.66 20 11.25 20H10.75C10.34 20 10 19.66 10 19.25V17.72C9.39 17.36 9 16.71 9 16V7C9 4 12 4 15.5 4S22 4 22 7M13 15C13 14.45 12.55 14 12 14S11 14.45 11 15 11.45 16 12 16 13 15.55 13 15M20 15C20 14.45 19.55 14 19 14S18 14.45 18 15 18.45 16 19 16 20 15.55 20 15M20 7H11V11H20V7M7 9.5C6.97 8.12 5.83 7 4.45 7.05C3.07 7.08 1.97 8.22 2 9.6C2.03 10.77 2.86 11.77 4 12V20H5V12C6.18 11.76 7 10.71 7 9.5Z"}}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_activeTab")||e.has("_versionMismatch")||e.has("_expandedTraffic")||e.has("_expandedElevator")||e.has("_expandedRows")||e.has("_expandedTransfers")||e.has("_qrOpenFor")||e.has("_debugTraffic")||e.has("_debugElevator"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._resolveStops().map(e=>e.entity);return i.some(e=>t.states[e]!==this.hass.states[e])}_lang(){return this.hass?.language?.startsWith("de")?"de":"en"}_t(e,t){return Oe(`modern.${e}`,{hassLanguage:this.hass?.language},t)}async _checkCardVersion(){this._versionMismatch=await async function(e,t,i){if(!e?.callWS)return null;try{const r=await e.callWS({type:t});if(r?.version&&r.version!==i)return r.version}catch{}return null}(this.hass,"wiener_linien_austria/card_version","1.4.1")}_resolveStops(){const e=(this._config?.entities??[]).filter(e=>this.hass?.states?.[e.entity]);if(e.length)return e;const t=st(this.hass)[0];if(t){if(!this._fallbackWarned&&(this._config?.entities?.length??0)>0){this._fallbackWarned=!0;const e=this._config?.entities.map(e=>e.entity).join(", ");console.warn(`[wiener-linien-austria-card] configured entity "${e}" not in hass.states; falling back to "${t}"`)}return[{entity:t}]}return[]}_attrs(e){return this.hass?.states?.[e]?.attributes??{}}render(){if(!this._config)return I;if(!this.hass)return B`<ha-card><div class="wrap"></div></ha-card>`;const e=this._config,t=this._resolveStops(),i="tabs"===e.layout&&t.length>=2,r=e.hide_attribution?"":t.map(e=>this._attrs(e.entity).attribution).find(e=>"string"==typeof e&&e.length>0)||"Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0";return B`
      <ha-card>
        ${i?this._renderTabs(t,this._activeTab):I}
        <div class="wrap">
          ${Ue(this._versionMismatch,e=>this._t(e))}
          ${e.show_traffic_info?this._renderTrafficBanner(t):I}
          ${this._renderBody(t,i)}
          ${this._renderFooter(r)}
        </div>
      </ha-card>
    `}_renderFooter(e){const t=this._isDevMode();return e||t?B`
      ${e?B`<div class="foot">
            <span class="timestamp">${e}</span>
          </div>`:I}
      ${t?this._renderDevModePanel():I}
    `:I}_renderBody(e,t){if(!e.length)return this._renderEmpty();if(t){const t=e[this._activeTab]??e[0];return B`${this._renderStop(t,this._activeTab)}`}return B`${e.map(e=>this._renderStop(e))}`}_renderEmpty(){const e=st(this.hass).length?"no_entities_picked":"no_entities_available";return B`<div class="empty" role="status" aria-live="polite">${this._t(e)}</div>`}_renderTabs(e,t){return B`
      <div class="tabs" role="tablist">
        ${e.map((i,r)=>{const n=this._attrs(i.entity),a=n.stop_name||n.friendly_name||i.entity,o=r===t;return B`<button
            type="button"
            role="tab"
            id=${`wl-tab-${r}`}
            aria-controls=${`wl-tabpanel-${r}`}
            class=${we({tab:!0,active:r===t})}
            aria-selected=${o?"true":"false"}
            tabindex=${o?"0":"-1"}
            @click=${()=>this._setActiveTab(r)}
            @keydown=${t=>this._onTabKeydown(t,r,e.length)}
          >${a}</button>`})}
      </div>
    `}_setActiveTab(e){if(!Number.isFinite(e)||e===this._activeTab)return;const t=this._resolveStops(),i=t[this._activeTab]?.entity,r=t[e]?.entity;i&&r&&this._qrOpenFor===i&&(this._qrOpenFor=r),this._activeTab=e}_onTabKeydown(e,t,i){let r=t;switch(e.key){case"ArrowRight":r=(t+1)%i;break;case"ArrowLeft":r=(t-1+i)%i;break;case"Home":r=0;break;case"End":r=i-1;break;default:return}e.preventDefault(),this._setActiveTab(r),this.updateComplete.then(()=>{const e=this.shadowRoot?.querySelectorAll('.tabs [role="tab"]');e?.[r]?.focus()})}_renderStop(e,t){const i=this._attrs(e.entity),r=i.stop_name||i.friendly_name,n=r||e.entity,a=function(e,t){const{lines:i,direction:r,line_directions:n,walk_times:a,accessibility_only:o}=t,s=i&&i.length?new Set(i):null;return e.filter(e=>{if(s&&!s.has(e.line))return!1;const t=n?.[e.line]??r;if(t&&e.direction!==t)return!1;if(a){const t=a[ct(e.line,String(e.direction??""))];if("number"==typeof t&&e.countdown<t)return!1}return!(o&&!e.barrier_free)})}(Array.isArray(i.departures)?i.departures:[],{...e,accessibility_only:this._config.accessibility_only}),o=Array.isArray(i.elevator_info)?i.elevator_info:[],s=this._debugElevator.filter(t=>t.__debug_entity===e.entity),l=[...o,...s],d=this._config.show_elevator_info&&l.length>0,c=this._stopMapUrl(n,i.latitude,i.longitude),h=this._stopGeoUri(n,i.latitude,i.longitude)??c,p=!1!==this._config.show_qr_button&&null!==h,u=this._t("open_in_maps"),f=this._t("qr_open"),_=this._computeHeroGroup(a),g=_[0],m=this._config.show_hero_metric?new Set(_):new Set,b=a.filter(e=>!m.has(e)),v=b.slice(0,this._config.max_departures),w=wt(this.hass,e.entity),y=g?ot(g.line||"",this._config.line_colors,w):"var(--primary-color)",x=($=g?.type,Fe($)??"mdi:bus-stop");var $;const k=g&&Number.isFinite(g.countdown)?g.countdown:null,A=null===k?"—":k<=0?this._t("now"):String(k),S=null!==k&&k>0?this._t("min"):"",z=void 0!==t;return B`
      <section
        class="station"
        style="--wl-accent: ${y};"
        id=${z?`wl-tabpanel-${t}`:I}
        role=${z?"tabpanel":I}
        aria-labelledby=${z?`wl-tab-${t}`:I}
        tabindex=${z?"0":I}
        aria-label=${n}
      >
        ${this._config.hide_header?I:B`<header class="head">
              <span class="icon-tile" aria-hidden="true">
                <ha-icon icon=${x}></ha-icon>
              </span>
              <div class="title-block">
                <h3 class="title">${qe(r,e.entity)}</h3>
                ${g?.line?B`<p class="subtitle">${qe(g.towards)}</p>`:I}
              </div>
              ${c||p?B`<div class="head-actions">
                    ${p?B`<button
                          type="button"
                          class=${we({"icon-action":!0,"qr-toggle":!0,expanded:this._qrOpenFor===e.entity})}
                          title=${f}
                          aria-label="${f}: ${n}"
                          aria-expanded=${this._qrOpenFor===e.entity?"true":"false"}
                          aria-controls="wl-qr-${e.entity.replace(/[^a-z0-9_]/gi,"_")}"
                          @click=${()=>this._toggleQrFor(e.entity)}
                        ><ha-icon icon="mdi:qrcode" aria-hidden="true"></ha-icon></button>`:I}
                    ${c?B`<a
                          class="icon-action"
                          href=${c}
                          target="_blank"
                          rel="noopener noreferrer"
                          title=${u}
                          aria-label="${u}: ${n}"
                        ><ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon></a>`:I}
                  </div>`:I}
            </header>`}
        ${p&&h?this._renderQrPanel(e.entity,n,h,x,this._qrOpenFor===e.entity):I}

        ${this._config.show_hero_metric&&g?B`<div class="hero-host">
              <div class="hero">
                <div class="hero-time" aria-live="polite" aria-atomic="true">
                  <span class="hero-min">${A}</span>
                  ${S?B`<span class="hero-unit">${S}</span>`:I}
                </div>
                ${_.flatMap(t=>[this._renderHeroEntry(t,e.entity),this._renderHeroPanelForEntry(t,e.entity)])}
              </div>
            </div>`:I}
        ${d?this._renderElevatorDetails(l):I}
        ${this._config.show_departures&&this._config.max_departures>0?v.length?B`<ul class="dep-list" role="list" aria-label=${this._t("departures_list")}>
                ${v.map(t=>this._renderRow(t,e.entity))}
              </ul>`:B`<div class="empty" role="status" aria-live="polite">
                ${this._t(i.server_time?"betriebsschluss":"no_data")}
              </div>`:I}
      </section>
    `}_renderElevatorDetails(e){return B`
      <div class="alert-list">
        ${e.map(e=>this._renderElevatorDetail(e))}
      </div>
    `}_renderElevatorDetail(e){const t=e.description||e.station||"",i=e.reason||"",r=_t(e.time_end,this._lang()),n=Boolean(i||r),a=this._expandedElevator.has(e.name);return B`
      <div
        class=${we({alert:!0,expanded:a,"no-detail":!n})}
        role=${n?"button":"group"}
        tabindex=${n?"0":"-1"}
        aria-expanded=${n?a?"true":"false":I}
        aria-label=${t}
        @click=${()=>n&&this._toggleElevator(e.name)}
        @keydown=${t=>this._onExpanderKeydown(t,n,()=>this._toggleElevator(e.name))}
      >
        <ha-icon icon="mdi:elevator-passenger-off" aria-hidden="true"></ha-icon>
        <div class="alert-body">
          <div class="alert-summary">
            <div class="alert-title">${qe(t)}</div>
          </div>
          ${n?B`<div class="alert-detail">
                <div class="alert-detail-inner">
                  ${i?B`<div class="alert-desc">${qe(i)}</div>`:I}
                  ${r?B`<div class="alert-meta">
                        <span>${this._t("elevator_until")} ${r}</span>
                      </div>`:I}
                </div>
              </div>`:I}
        </div>
        ${n?B`<ha-icon class="alert-chevron" icon="mdi:chevron-down" aria-hidden="true"></ha-icon>`:I}
      </div>
    `}_toggleElevator(e){const t=new Set(this._expandedElevator);t.has(e)?t.delete(e):t.add(e),this._expandedElevator=t}_onExpanderKeydown(e,t,i){t&&("Enter"!==e.key&&" "!==e.key||(e.preventDefault(),i()))}_renderTrafficBanner(e){const t=new Set,i=[];for(const r of e)for(const e of this._attrs(r.entity).traffic_info??[])t.has(e.name)||(t.add(e.name),i.push(e));for(const e of this._debugTraffic)t.has(e.name)||(t.add(e.name),i.push(e));return i.length?B`
      <div class="alert-list">
        ${i.map(e=>this._renderTrafficItem(e))}
      </div>
    `:I}_renderTrafficItem(e){const t=this._config.line_colors,i=lt(this.hass,this._config.entities.map(e=>e.entity)),r=Array.isArray(e.related_lines)?e.related_lines:[],n=e.description_html?ft(e.description_html):e.description?ft(e.description):"",a=_t(e.time_end,this._lang()),o=_t(e.time_last_update,this._lang()),s=_t(e.time_created,this._lang()),l=o&&o!==s?o:"",d=Boolean(e.location||a||l),c=Boolean(n||d),h=this._expandedTraffic.has(e.name),p={alert:!0,expanded:h,"no-detail":!c},u=e.title||this._t("traffic_label");return B`
      <div
        class=${we(p)}
        role=${c?"button":"group"}
        tabindex=${c?"0":"-1"}
        aria-expanded=${c?h?"true":"false":I}
        aria-label=${u}
        @click=${()=>c&&this._toggleTraffic(e.name)}
        @keydown=${t=>this._onExpanderKeydown(t,c,()=>this._toggleTraffic(e.name))}
      >
        <ha-icon icon="mdi:alert-octagon" aria-hidden="true"></ha-icon>
        <div class="alert-body">
          <div class="alert-summary">
            ${r.length?B`<div class="alert-lines">
                  ${r.map(e=>B`<span
                      class="alert-line-badge"
                      style=${$e(at(e,t,i))}
                    >${e}</span>`)}
                </div>`:I}
            <div class="alert-title">${e.title?qe(e.title):this._t("traffic_label")}</div>
          </div>
          ${c?B`<div class="alert-detail">
                <div class="alert-detail-inner">
                  ${n?B`<div class="alert-desc">${ve(n)}</div>`:I}
                  ${d?B`<div class="alert-meta">
                        ${e.location?B`<span class="alert-location-chip">
                              <ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon>${qe(e.location)}
                            </span>`:I}
                        ${a?B`<span>${this._t("traffic_until")} ${a}</span>`:I}
                        ${l?B`<span>${this._t("traffic_updated")} ${l}</span>`:I}
                      </div>`:I}
                </div>
              </div>`:I}
        </div>
        ${c?B`<ha-icon class="alert-chevron" icon="mdi:chevron-down" aria-hidden="true"></ha-icon>`:I}
      </div>
    `}_toggleTraffic(e){const t=new Set(this._expandedTraffic);t.has(e)?t.delete(e):t.add(e),this._expandedTraffic=t}_computeHeroGroup(e){if(0===e.length)return[];const t=e=>Number.isFinite(e.countdown)?e.countdown:Number.POSITIVE_INFINITY;let i=Number.POSITIVE_INFINITY;for(const r of e){const e=t(r);e<i&&(i=e)}if(!Number.isFinite(i)){const t=e[0];return t?[t]:[]}return i<=0?e.filter(e=>t(e)<=0):e.filter(e=>t(e)===i)}_renderHeroEntry(e,t){const i=at(e.line||"",this._config.line_colors,wt(this.hass,t)),r=this._config.show_platform&&e.platform?String(e.platform):null,n=!!e.barrier_free&&this._config.show_accessibility,a=ut(this._config.show_stops_ahead,e),o=this._rowKey(e,t),s=a&&this._expandedRows.has(o),l=this._panelId(e,t,"hero"),d=s?"stops_ahead_aria_hide":"stops_ahead_aria_show",c=a?this._t(d,{line:e.line||"?",towards:e.towards||""}):"",h={"hero-entry":!0,expandable:a,expanded:s},p=e.line||"?";return B`
      <div
        class=${we(h)}
        role=${a?"button":I}
        tabindex=${a?"0":I}
        aria-expanded=${a?s?"true":"false":I}
        aria-controls=${a?l:I}
        aria-label=${a?c:I}
        @click=${()=>a&&this._toggleRow(o)}
        @keydown=${e=>this._onExpanderKeydown(e,a,()=>this._toggleRow(o))}
      >
        <span
          class="line-badge"
          style=${$e(i)}
        >${p}</span>
        <span class="hero-direction">${qe(e.towards)}</span>
        ${r?B`<span class="hero-platform"
              >${this._t(bt(e.type))} ${r}</span
            >`:I}
        ${n?B`<span
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
        ${a?B`<ha-icon
              class="hero-chevron"
              icon="mdi:chevron-down"
              aria-hidden="true"
            ></ha-icon>`:I}
      </div>
    `}_renderHeroPanelForEntry(e,t){if(!ut(this._config.show_stops_ahead,e))return I;const i=this._rowKey(e,t),r=this._expandedRows.has(i),n=this._panelId(e,t,"hero"),a=e.line||"?";return this._renderHeroStopsAheadPanel(e.stops_ahead,n,r,a,i,t)}_renderHeroStopsAheadPanel(e,t,i,r,n,a){const o=this._config.line_colors,s=wt(this.hass,a);return B`
      <div
        class=${we({"hero-detail":!0,expanded:i})}
        id=${t}
        role="region"
        aria-hidden=${i?"false":"true"}
      >
        <div class="hero-detail-inner">
          <ol
            class="stops-ahead"
            style=${$e({"--stops-ahead-line":ot(r,o,s)})}
          >
            ${e.map((e,t)=>this._renderStopAhead(e,t,n,o,s))}
          </ol>
        </div>
      </div>
    `}_renderRow(e,t){const i=this._config.line_colors,r=wt(this.hass,t),n=e.line||"?",a=at(n,i,r),o=Number.isFinite(e.countdown)?e.countdown:null,s=null===o?"—":o<=0?this._t("now"):`${o} ${this._t("min")}`,l=function(e,t){if(!e||!t)return null;const i=Date.parse(e),r=Date.parse(t);return Number.isFinite(i)&&Number.isFinite(r)?Math.round((r-i)/6e4):null}(e.time_planned,e.time_real),d=this._config.show_delay&&null!==l&&l>=1?1===l?this._t("delay_singular"):this._t("delay_plural",{n:l}):"",c=null!==o&&o<=0?"now":null!==l&&l>=1?"late":null!==l&&l<=-1?"early":"",h=this._config.show_accessibility,p=Boolean(e.traffic_jam||h&&e.barrier_free),u=this._config.show_platform&&e.platform?String(e.platform):null,f=this._config.show_type_icon?Fe(e.type):null,_=ut(this._config.show_stops_ahead,e),g=this._rowKey(e,t),m=_&&this._expandedRows.has(g),b=this._panelId(e,t,"row"),v=m?"stops_ahead_aria_hide":"stops_ahead_aria_show",w=_?this._t(v,{line:n,towards:e.towards||""}):"",y=B`
      <li
        class=${we({"dep-row":!0,expandable:_,expanded:m})}
        role=${_?"button":I}
        tabindex=${_?"0":I}
        aria-expanded=${_?m?"true":"false":I}
        aria-controls=${_?b:I}
        aria-label=${_?w:I}
        @click=${()=>_&&this._toggleRow(g)}
        @keydown=${e=>this._onExpanderKeydown(e,_,()=>this._toggleRow(g))}
      >
        <div class="line-badge" style=${$e(a)}>${n}</div>
        <div class="towards">
          ${f?B`<ha-icon class="type-icon" icon=${f} aria-hidden="true"></ha-icon>`:I}
          <div class="towards-rows">
            <span class="towards-name">${qe(e.towards)}</span>${d?B`<span class="delay">${d}</span>`:I}
          </div>
        </div>
        ${u||p?B`<span class="row-end">
              ${u?B`<span class="row-platform"
                    >${this._t(bt(e.type))} ${u}</span
                  >`:I}
              ${p?B`<span class="row-flags">
                    ${e.traffic_jam?B`<ha-icon
                          class="disturbance"
                          icon="mdi:alert-circle"
                          role="img"
                          aria-label=${this._t("disturbance_title")}
                          title=${this._t("disturbance_title")}
                        ></ha-icon>`:I}
                    ${h&&e.barrier_free?B`<ha-icon
                          class="a11y"
                          icon="mdi:wheelchair-accessibility"
                          role="img"
                          aria-label=${this._t("barrier_free_title")}
                          title=${this._t("barrier_free_title")}
                        ></ha-icon>`:I}
                  </span>`:I}
            </span>`:B`<span></span>`}
        <div class=${we({countdown:!0,[c]:!!c})}>${s}</div>
        ${_?B`<ha-icon
              class="row-chevron"
              icon="mdi:chevron-down"
              aria-hidden="true"
            ></ha-icon>`:I}
      </li>
    `;return _?[y,this._renderStopsAheadPanel(e.stops_ahead,b,m,n,g,t)]:y}_renderStopsAheadPanel(e,t,i,r,n,a){const o=this._config.line_colors,s=wt(this.hass,a);return B`
      <li
        class=${we({"dep-row-detail":!0,expanded:i})}
        id=${t}
        role="region"
        aria-hidden=${i?"false":"true"}
      >
        <div class="dep-row-detail-inner">
          <ol
            class="stops-ahead"
            style=${$e({"--stops-ahead-line":ot(r,o,s)})}
          >
            ${e.map((e,t)=>this._renderStopAhead(e,t,n,o,s))}
          </ol>
        </div>
      </li>
    `}_renderStopAhead(e,t,i,r,n){const a=e.lines??[],o=this._isNightlineHour(),s=[],l=[];for(const e of a)/^U\d/.test(e)||o&&/^N\d/.test(e)?s.push(e):l.push(e);const d=`${i}|${t}`,c=this._expandedTransfers.has(d),h={"stops-ahead-stop":!0,terminus:!!e.is_terminus,"transfers-expanded":c},p=s.length?B`<span class="stops-ahead-metros">
          ${s.map(e=>B`<span
              class="stops-ahead-line-chip"
              style=${$e(at(e,r,n))}
              >${e}</span
            >`)}
        </span>`:I,u=l.length?B`<button
          type="button"
          class="stops-ahead-other-toggle"
          aria-expanded=${c?"true":"false"}
          aria-label=${this._t(c?"stops_ahead_other_hide":"stops_ahead_other_show",{count:l.length,stop:e.name})}
          @click=${e=>{e.stopPropagation(),this._toggleTransfers(d)}}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||e.stopPropagation()}}
        >
          <span class="stops-ahead-other-count">+${l.length}</span>
          <ha-icon icon="mdi:chevron-down" aria-hidden="true"></ha-icon>
        </button>`:I,f=l.length&&c?B`<div class="stops-ahead-others">
            ${l.map(e=>B`<span
                class="stops-ahead-line-chip stops-ahead-line-chip--other"
                style=${$e(at(e,r,n))}
                >${e}</span
              >`)}
          </div>`:I,_=l.length>0,g=_?this._t(c?"stops_ahead_other_hide":"stops_ahead_other_show",{count:l.length,stop:e.name}):"";return B`
      <li class=${we(h)}>
        <div
          class="stops-ahead-row"
          role=${_?"button":I}
          tabindex=${_?"0":I}
          aria-expanded=${_?c?"true":"false":I}
          aria-label=${_?g:I}
          @click=${_?e=>{e.stopPropagation(),this._toggleTransfers(d)}:I}
          @keydown=${_?e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),e.stopPropagation(),this._toggleTransfers(d))}:I}
        >
          <span class="stops-ahead-dot" aria-hidden="true"></span>
          <span class="stops-ahead-name">${qe(e.name)}</span>
          ${p} ${u}
        </div>
        ${f}
      </li>
    `}_toggleTransfers(e){const t=new Set(this._expandedTransfers);t.has(e)?t.delete(e):t.add(e),this._expandedTransfers=t}_isNightlineHour(){const e=function(e){let t=vt.get(e);return t||(t=new Intl.DateTimeFormat("en-GB",{timeZone:e,hour:"2-digit",minute:"2-digit",hour12:!1}),vt.set(e,t)),t}(this.hass?.config?.time_zone||"Europe/Vienna").formatToParts(new Date),t=Number(e.find(e=>"hour"===e.type)?.value??"0"),i=Number(e.find(e=>"minute"===e.type)?.value??"0"),r=60*t+i;return r>=1435||r<=315}_rowKey(e,t){const i=e.time_planned??`cd${e.countdown}`;return`${t}|${e.line}|${e.direction}|${e.towards??""}|${i}`}_panelId(e,t,i){return`${"hero"===i?"wl-hero-stopsahead":"wl-stopsahead"}-${t.replace(/[^a-z0-9_]/gi,"_")}-${e.line}-${e.direction}-${e.countdown}`}_toggleRow(e){const t=new Set(this._expandedRows);t.has(e)?t.delete(e):t.add(e),this._expandedRows=t}_stopMapUrl(e,t,i){let r=null;return"number"==typeof t&&"number"==typeof i?r=`https://stadtplan.wien.gv.at/#/@${i},${t},17.5,0,0,standard/themes`:e&&(r=`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${e}, Wien`)}`),r?("string"!=typeof(n=r)?"":/^https?:\/\//i.test(n)?n:"")||null:null;var n}_stopGeoUri(e,t,i){if("number"!=typeof t||"number"!=typeof i)return null;return`geo:${t},${i}?q=${t},${i}${e?`(${encodeURIComponent(e)})`:""}`}_toggleQrFor(e){this._qrOpenFor=this._qrOpenFor===e?null:e}_renderQrPanel(e,t,i,r,n){const a=`wl-qr-${e.replace(/[^a-z0-9_]/gi,"_")}`,o=this._t("qr_dialog_title"),s=this._t("qr_dialog_hint");return B`
      <div
        class=${we({"qr-panel":!0,expanded:n})}
        id=${a}
        role="region"
        aria-hidden=${n?"false":"true"}
        aria-label="${o}: ${t}"
      >
        <div class="qr-panel-inner">
          <div
            class="qr-panel-body"
            @click=${()=>this._toggleQrFor(e)}
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
    `}_isDevMode(){try{if((window.location.search||"").includes("wl_debug=1"))return!0;if("1"===window.localStorage?.getItem("wl_debug"))return!0}catch{}return!1}_renderDevModePanel(){return this._isDevMode()?B`
      <div class="dev-strip">
        <span class="dev-strip-label">${this._t("devmode_title")}</span>
        <button type="button" @click=${this._devTestTraffic}>${this._t("devmode_traffic_btn")}</button>
        <button type="button" @click=${this._devTestElevator}>${this._t("devmode_elevator_btn")}</button>
        <button type="button" class="dev-strip-clear" @click=${this._devClear}>
          ${this._t("devmode_clear_btn")}
        </button>
      </div>
    `:I}_randomFrom(e){return e.length?e[Math.floor(Math.random()*e.length)]??null:null}static{this.styles=ze}};e([pe({attribute:!1})],yt.prototype,"hass",void 0),e([ue()],yt.prototype,"_config",void 0),e([ue()],yt.prototype,"_activeTab",void 0),e([ue()],yt.prototype,"_versionMismatch",void 0),e([ue()],yt.prototype,"_expandedTraffic",void 0),e([ue()],yt.prototype,"_expandedElevator",void 0),e([ue()],yt.prototype,"_expandedRows",void 0),e([ue()],yt.prototype,"_expandedTransfers",void 0),e([ue()],yt.prototype,"_debugTraffic",void 0),e([ue()],yt.prototype,"_debugElevator",void 0),e([ue()],yt.prototype,"_qrOpenFor",void 0),yt=e([de("wiener-linien-austria-card")],yt);export{yt as WienerLinienAustriaCard};

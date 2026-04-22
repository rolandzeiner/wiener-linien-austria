// Wiener Linien Austria — bundled by Rollup. Edit sources in src/, then `npm run build`.
function e(e,t,i,s){var r,n=arguments.length,o=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,s);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(o=(n<3?r(o):n>3?r(t,i,o):r(t,i))||o);return n>3&&o&&Object.defineProperty(t,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;let n=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=r.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(t,e))}return e}toString(){return this.cssText}};const o=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]);return new n(i,e,s)},a=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new n("string"==typeof e?e:e+"",void 0,s))(t)})(e):e,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,_=globalThis,f=_.trustedTypes,g=f?f.emptyScript:"",m=_.reactiveElementPolyfillSupport,b=(e,t)=>e,v={toAttribute(e,t){switch(t){case Boolean:e=e?g:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},y=(e,t)=>!l(e,t),w={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=w){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);void 0!==s&&d(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:r}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:s,set(t){const n=s?.call(this);r?.call(this,t),this.requestUpdate(e,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??w}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,s)=>{if(i)e.adoptedStyleSheets=s.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of s){const s=document.createElement("style"),r=t.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,e.appendChild(s)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:v).toAttribute(t,i.type);this._$Em=e,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(void 0!==s&&this._$Em!==s){const e=i.getPropertyOptions(s),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:v;this._$Em=s;const n=r.fromAttribute(t,e.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(e,t,i,s=!1,r){if(void 0!==e){const n=this.constructor;if(!1===s&&(r=this[e]),i??=n.getPropertyOptions(e),!((i.hasChanged??y)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:r},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),!0!==r||void 0!==n)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===s&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,s=this[t];!0!==e||this._$AL.has(t)||void 0===s||this.C(t,void 0,i,s)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[b("elementProperties")]=new Map,$[b("finalized")]=new Map,m?.({ReactiveElement:$}),(_.reactiveElementVersions??=[]).push("2.1.2");const x=globalThis,A=e=>e,S=x.trustedTypes,k=S?S.createPolicy("lit-html",{createHTML:e=>e}):void 0,E="$lit$",z=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+z,R=`<${C}>`,H=document,P=()=>H.createComment(""),O=e=>null===e||"object"!=typeof e&&"function"!=typeof e,L=Array.isArray,N="[ \t\n\f\r]",U=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,M=/-->/g,T=/>/g,D=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,W=/"/g,B=/^(?:script|style|textarea|title)$/i,F=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),I=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),V=new WeakMap,q=H.createTreeWalker(H,129);function G(e,t){if(!L(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==k?k.createHTML(t):t}const Z=(e,t)=>{const i=e.length-1,s=[];let r,n=2===t?"<svg>":3===t?"<math>":"",o=U;for(let t=0;t<i;t++){const i=e[t];let a,l,d=-1,c=0;for(;c<i.length&&(o.lastIndex=c,l=o.exec(i),null!==l);)c=o.lastIndex,o===U?"!--"===l[1]?o=M:void 0!==l[1]?o=T:void 0!==l[2]?(B.test(l[2])&&(r=RegExp("</"+l[2],"g")),o=D):void 0!==l[3]&&(o=D):o===D?">"===l[0]?(o=r??U,d=-1):void 0===l[1]?d=-2:(d=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?D:'"'===l[3]?W:j):o===W||o===j?o=D:o===M||o===T?o=U:(o=D,r=void 0);const h=o===D&&e[t+1].startsWith("/>")?" ":"";n+=o===U?i+R:d>=0?(s.push(a),i.slice(0,d)+E+i.slice(d)+z+h):i+z+(-2===d?t:h)}return[G(e,n+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),s]};class J{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,n=0;const o=e.length-1,a=this.parts,[l,d]=Z(e,t);if(this.el=J.createElement(l,i),q.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(s=q.nextNode())&&a.length<o;){if(1===s.nodeType){if(s.hasAttributes())for(const e of s.getAttributeNames())if(e.endsWith(E)){const t=d[n++],i=s.getAttribute(e).split(z),o=/([.?@])?(.*)/.exec(t);a.push({type:1,index:r,name:o[2],strings:i,ctor:"."===o[1]?te:"?"===o[1]?ie:"@"===o[1]?se:ee}),s.removeAttribute(e)}else e.startsWith(z)&&(a.push({type:6,index:r}),s.removeAttribute(e));if(B.test(s.tagName)){const e=s.textContent.split(z),t=e.length-1;if(t>0){s.textContent=S?S.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],P()),q.nextNode(),a.push({type:2,index:++r});s.append(e[t],P())}}}else if(8===s.nodeType)if(s.data===C)a.push({type:2,index:r});else{let e=-1;for(;-1!==(e=s.data.indexOf(z,e+1));)a.push({type:7,index:r}),e+=z.length-1}r++}}static createElement(e,t){const i=H.createElement("template");return i.innerHTML=e,i}}function Y(e,t,i=e,s){if(t===I)return t;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const n=O(t)?void 0:t._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),void 0===n?r=void 0:(r=new n(e),r._$AT(e,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(t=Y(e,r._$AS(e,t.values),r,s)),t}class Q{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??H).importNode(t,!0);q.currentNode=s;let r=q.nextNode(),n=0,o=0,a=i[0];for(;void 0!==a;){if(n===a.index){let t;2===a.type?t=new X(r,r.nextSibling,this,e):1===a.type?t=new a.ctor(r,a.name,a.strings,this,e):6===a.type&&(t=new re(r,this,e)),this._$AV.push(t),a=i[++o]}n!==a?.index&&(r=q.nextNode(),n++)}return q.currentNode=H,s}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Y(this,e,t),O(e)?e===K||null==e||""===e?(this._$AH!==K&&this._$AR(),this._$AH=K):e!==this._$AH&&e!==I&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>L(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==K&&O(this._$AH)?this._$AA.nextSibling.data=e:this.T(H.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=J.createElement(G(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const e=new Q(s,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=V.get(e.strings);return void 0===t&&V.set(e.strings,t=new J(e)),t}k(e){L(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const r of e)s===t.length?t.push(i=new X(this.O(P()),this.O(P()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=A(e).nextSibling;A(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ee{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,r){this.type=1,this._$AH=K,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=K}_$AI(e,t=this,i,s){const r=this.strings;let n=!1;if(void 0===r)e=Y(this,e,t,0),n=!O(e)||e!==this._$AH&&e!==I,n&&(this._$AH=e);else{const s=e;let o,a;for(e=r[0],o=0;o<r.length-1;o++)a=Y(this,s[i+o],t,o),a===I&&(a=this._$AH[o]),n||=!O(a)||a!==this._$AH[o],a===K?e=K:e!==K&&(e+=(a??"")+r[o+1]),this._$AH[o]=a}n&&!s&&this.j(e)}j(e){e===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===K?void 0:e}}class ie extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==K)}}class se extends ee{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){if((e=Y(this,e,t,0)??K)===I)return;const i=this._$AH,s=e===K&&i!==K||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==K&&(i===K||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class re{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Y(this,e)}}const ne=x.litHtmlPolyfillSupport;ne?.(J,X),(x.litHtmlVersions??=[]).push("3.3.2");const oe=globalThis;let ae=class extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const s=i?.renderBefore??t;let r=s._$litPart$;if(void 0===r){const e=i?.renderBefore??null;s._$litPart$=r=new X(t.insertBefore(P(),e),e,void 0,i??{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};ae._$litElement$=!0,ae.finalized=!0,oe.litElementHydrateSupport?.({LitElement:ae});const le=oe.litElementPolyfillSupport;le?.({LitElement:ae}),(oe.litElementVersions??=[]).push("4.2.2");const de=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},ce={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:y},he=(e=ce,t,i)=>{const{kind:s,metadata:r}=i;let n=globalThis.litPropertyMetadata.get(r);if(void 0===n&&globalThis.litPropertyMetadata.set(r,n=new Map),"setter"===s&&((e=Object.create(e)).wrapped=!0),n.set(i.name,e),"accessor"===s){const{name:s}=i;return{set(i){const r=t.get.call(this);t.set.call(this,i),this.requestUpdate(s,r,e,!0,i)},init(t){return void 0!==t&&this.C(s,void 0,e,t),t}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];t.call(this,i),this.requestUpdate(s,r,e,!0,i)}}throw Error("Unsupported decorator location: "+s)};function pe(e){return(t,i)=>"object"==typeof i?he(e,t,i):((e,t,i)=>{const s=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),s?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function ue(e){return pe({...e,state:!0,attribute:!1})}const _e=1,fe=e=>(...t)=>({_$litDirective$:e,values:t});let ge=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const me=fe(class extends ge{constructor(e){if(super(e),e.type!==_e||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e)));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const i=e.element.classList;for(const e of this.st)e in t||(i.remove(e),this.st.delete(e));for(const e in t){const s=!!t[e];s===this.st.has(e)||this.nt?.has(e)||(s?(i.add(e),this.st.add(e)):(i.remove(e),this.st.delete(e)))}return I}}),be="important",ve=" !"+be,ye=fe(class extends ge{constructor(e){if(super(e),e.type!==_e||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,i)=>{const s=e[i];return null==s?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?i.removeProperty(e):i[e]=null);for(const e in t){const s=t[e];if(null!=s){this.ft.add(e);const t="string"==typeof s&&s.endsWith(ve);e.includes("-")||t?i.setProperty(e,t?s.slice(0,-11):s,t?be:""):i[e]=s}}return I}}),we="1.2.0-beta-1",$e={U1:"#E3000F",U2:"#A862A4",U3:"#EF7C00",U4:"#00963F",U5:"#008F95",U6:"#9D6830"};var xe={no_data:"Keine Abfahrten verfügbar",betriebsschluss:"Betriebsschluss",min:"min",now:"jetzt",version_update:"Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",no_entities_picked:"Keine Haltestelle ausgewählt",no_entities_available:"Keine Wiener-Linien-Sensoren gefunden",barrier_free_title:"Barrierefrei zugänglich",disturbance_title:"Verkehrsbehinderung gemeldet",dir_h:"H",dir_r:"R",dir_both:"Beide",traffic_label:"Störung",traffic_until:"Bis",traffic_updated:"aktualisiert",elevator_label:"Aufzug außer Betrieb",elevator_until:"Bis",open_in_maps:"In Karte öffnen",delay_singular:"1 Minute verspätet",delay_plural:"{n} Minuten verspätet",devmode_title:"DEV",devmode_traffic_btn:"Test Störung",devmode_elevator_btn:"Test Aufzug",devmode_clear_btn:"Löschen",editor:{section_sensors:"Haltestellen",sensors_hint:"Eine oder mehrere Haltestellen auswählen",section_filters:"Filter pro Haltestelle",filters_hint:"Linien und/oder Richtung pro Haltestelle einschränken",lines_label:"Linien",direction_label:"Richtung",walk_time_label:"Fußweg (min)",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis du dort bist. Leer lassen = kein Filter.",walk_time_placeholder:"–",section_colors:"Linienfarben",colors_hint:"Optional: Farben überschreiben. U-Bahn-Standardwerte sind gesetzt.",reset_color:"Zurücksetzen",section_display:"Anzeige",max_departures:"Anzahl Abfahrten pro Haltestelle",show_accessibility:"Barrierefrei-Symbol anzeigen",show_traffic_info:"Störungen anzeigen",show_elevator_info:"Aufzugsinfo anzeigen",show_delay:"Verspätungen anzeigen",hide_attribution:"Datenquelle ausblenden",layout_label:"Layout mehrerer Haltestellen",layout_stacked:"Gestapelt",layout_tabs:"Reiter",no_sensors_available:"Keine Wiener-Linien-Sensoren verfügbar. Erst eine Haltestelle über Einstellungen → Geräte & Dienste hinzufügen.",no_lines_available:"Linien erscheinen hier, sobald Haltestellen ausgewählt wurden."}},Ae={no_entity:"Keine Haltestelle ausgewählt",no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",dir_h:"H",dir_r:"R",gleis:"GLEIS",steig:"STEIG",version_update:"Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",editor:{section_sensor:"Haltestelle",section_direction:"Richtung",section_line:"Linie",section_display:"Darstellung",sensor_hint:"Eine Haltestelle auswählen.",direction_hint:"Hin- oder Rückfahrt — die Retro-Anzeige zeigt nur eine Richtung.",direction_no_data:"Keine Abfahrten in dieser Richtung",line_hint:"Optional: nur eine Linie anzeigen. Aktiven Chip erneut antippen = alle Linien.",section_walk_time:"Fußweg zur Haltestelle",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis du dort bist. Leer lassen = kein Filter.",walk_time_no_data:"Keine Abfahrten in dieser Richtung. Richtung wechseln oder warten, bis der Sensor Linien meldet.",walk_time_placeholder:"–",show_platform:"Gleis/Steig anzeigen",show_station_name:"Stationsnamen anzeigen",section_station:"Stationsnamen-Schild",station_bg_label:"Hintergrund",station_bg_default:"Standard",station_bg_white:"Weiß",station_bg_black:"Schwarz",station_hint:"„Standard“ zeigt U-Bahn-Stationen in der Linienfarbe und alle anderen auf weiß. Oder wähle fix Weiß oder Schwarz.",size_label:"Größe",size_small:"Klein",size_medium:"Mittel",size_regular:"Normal",no_sensors:"Keine Wiener-Linien-Sensoren verfügbar. Erst eine Haltestelle über Einstellungen → Geräte & Dienste hinzufügen.",no_lines:"Für diese Haltestelle und Richtung sind aktuell keine Linien im Sensor."}},Se={modern:xe,retro:Ae},ke={no_data:"No departures available",betriebsschluss:"End of service",min:"min",now:"now",version_update:"Wiener Linien Austria updated to v{v} — please reload",version_reload:"Reload",no_entities_picked:"No stop selected",no_entities_available:"No Wiener Linien sensors found",barrier_free_title:"Step-free access",disturbance_title:"Traffic disruption reported",dir_h:"H",dir_r:"R",dir_both:"Both",traffic_label:"Disruption",traffic_until:"Until",traffic_updated:"updated",elevator_label:"Elevator out of service",elevator_until:"Until",open_in_maps:"Open in maps",delay_singular:"1 minute late",delay_plural:"{n} minutes late",devmode_title:"DEV",devmode_traffic_btn:"Test disruption",devmode_elevator_btn:"Test elevator",devmode_clear_btn:"Clear",editor:{section_sensors:"Stops",sensors_hint:"Pick one or more stops to display",section_filters:"Per-stop filters",filters_hint:"Optionally restrict lines or direction per stop",lines_label:"Lines",direction_label:"Direction",walk_time_label:"Walking time (min)",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_placeholder:"–",section_colors:"Line colours",colors_hint:"Optional overrides. Metro defaults are already set.",reset_color:"Reset",section_display:"Display",max_departures:"Departures per stop",show_accessibility:"Show step-free icon",show_traffic_info:"Show disruption alerts",show_elevator_info:"Show elevator outages",show_delay:"Show delays",hide_attribution:"Hide data source",layout_label:"Multi-stop layout",layout_stacked:"Stacked",layout_tabs:"Tabs",no_sensors_available:"No Wiener Linien sensors available. Add a stop first via Settings → Devices & Services.",no_lines_available:"Lines appear here once stops are selected."}},Ee={no_entity:"No stop selected",no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",dir_h:"H",dir_r:"R",gleis:"PLATF.",steig:"STAND",version_update:"Retro card updated to v{v} — please reload",version_reload:"Reload",editor:{section_sensor:"Stop",section_direction:"Direction",section_line:"Line",section_display:"Display",sensor_hint:"Pick a single stop.",direction_hint:"Outbound or return — the retro display only shows one direction.",direction_no_data:"No departures in this direction",line_hint:"Optional: restrict to a single line. Tap the active chip again to show all lines.",section_walk_time:"Walking time to stop",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_no_data:"No departures in this direction. Switch direction or wait until the sensor reports lines.",walk_time_placeholder:"–",show_platform:"Show platform",show_station_name:"Show station name",section_station:"Station name sign",station_bg_label:"Background",station_bg_default:"Default",station_bg_white:"White",station_bg_black:"Black",station_hint:"“Default” uses the line colour for U-Bahn stops and white for everything else. Or force white or black for all stops.",size_label:"Size",size_small:"Small",size_medium:"Medium",size_regular:"Regular",no_sensors:"No Wiener Linien sensors available. Add a stop first via Settings → Devices & Services.",no_lines:"The sensor currently reports no lines for this stop + direction."}},ze={modern:ke,retro:Ee};const Ce={de:Object.freeze({__proto__:null,default:Se,modern:xe,retro:Ae}),en:Object.freeze({__proto__:null,default:ze,modern:ke,retro:Ee})};function Re(e,t){const i=function(e,t){return e.split(".").reduce((e,t)=>{if(e&&"object"==typeof e&&t in e)return e[t]},t)}(e,t);return"string"==typeof i?i:void 0}function He(e,t,i){const s=function(e){return"en"===(e.configLanguage||e.hassLanguage||"de").replace("-","_").split("_")[0]?"en":"de"}(t);let r=Re(e,Ce[s]??Ce.de);if(void 0===r&&(r=Re(e,Ce.de)),void 0===r)return e;if(i)for(const[e,t]of Object.entries(i))r=r.replace(`{${e}}`,String(t));return r}const Pe=new Set(["small","medium","regular"]),Oe=new Set(["default","white","black"]);function Le(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,s]of Object.entries(e)){const e="number"==typeof s?s:"string"==typeof s?Number(s):NaN;Number.isFinite(e)&&(e<0||e>120||(t[i]=Math.round(e)))}return Object.keys(t).length?t:void 0}function Ne(e){const t="R"===e.direction?"R":"H",i=Pe.has(e.size)?e.size:"regular",s=Oe.has(e.station_bg)?e.station_bg:"default";return{entity:"string"==typeof e.entity&&e.entity.startsWith("sensor.")?e.entity:void 0,direction:t,line:"string"==typeof e.line&&e.line?e.line:void 0,show_platform:e.show_platform??!0,show_station_name:e.show_station_name??!1,station_bg:s,size:i,walk_times:Le(e.walk_times)}}function Ue(e,t,i){return`${e}|${t}|${i}`}function Me(e){if(!e)return[];const t=[];for(const[i,s]of Object.entries(e.states??{})){if(!i.startsWith("sensor."))continue;const e=s?.attributes??{};if("number"!=typeof e.diva)continue;if(!Array.isArray(e.departures))continue;(e.attribution??"").toLowerCase().includes("wiener linien")&&t.push(i)}return t.sort(),t}const Te=["small","medium","regular"],De=["default","white","black"];let je=class extends ae{setConfig(e){this._config=Ne(e)}_t(e){return He(`retro.${e}`,{hassLanguage:this.hass?.language})}_et(e){return He(`retro.editor.${e}`,{hassLanguage:this.hass?.language})}_fire(e){this._config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}_attrs(e){return e?this.hass?.states?.[e]?.attributes:void 0}_directionsWithData(){const e=this._attrs(this._config?.entity),t=new Set;for(const i of e?.departures??[])"H"!==i.direction&&"R"!==i.direction||t.add(i.direction);return t}_linesForCurrent(){if(!this._config)return[];const e=this._attrs(this._config.entity),t=this._config.direction,i=new Set;for(const s of e?.departures??[])s.direction===t&&s.line&&i.add(s.line);return[...i].sort()}_swallowKeys(e){e.stopPropagation()}_pickEntity(e){this._config&&this._fire({...this._config,entity:e})}_setDirection(e){this._config&&this._config.direction!==e&&this._fire({...this._config,direction:e})}_pickLine(e){if(!this._config)return;const t={...this._config};t.line===e?delete t.line:t.line=e,this._fire(t)}_setShowPlatform(e){this._config&&this._fire({...this._config,show_platform:e})}_setShowStationName(e){this._config&&this._fire({...this._config,show_station_name:e})}_setStationBg(e){this._config&&this._config.station_bg!==e&&this._fire({...this._config,station_bg:e})}_setSize(e){this._config&&this._config.size!==e&&this._fire({...this._config,size:e})}_setWalkTime(e,t){if(!this._config)return;const i=parseInt(t,10),s=Number.isFinite(i)&&i>0?Math.min(120,i):null,r={...this._config.walk_times??{}};null===s?delete r[e]:r[e]=s;const n={...this._config};Object.keys(r).length?n.walk_times=r:delete n.walk_times,this._fire(n)}render(){if(!this._config||!this.hass)return K;const e=this._config,t=Me(this.hass),i=this._directionsWithData();return F`
      <div class="editor">
        ${this._renderSensorSection(t)}
        ${this._renderDirectionSection(i)}
        ${this._renderLineSection()}
        ${this._renderWalkTimeSection()}
        ${this._renderStationSection(e.show_station_name,e.station_bg)}
        ${this._renderDisplaySection(e.show_platform,e.size)}
      </div>
    `}_renderSensorSection(e){const t=this._config.entity,i=e.length?e.map(e=>{const i=function(e,t){const i=e?.states?.[t],s=i?.attributes??{};return s.stop_name||s.friendly_name||t}(this.hass,e),s=e.split(".")[1]??e;return F`
            <button
              type="button"
              class=${me({chip:!0,selected:e===t})}
              @click=${()=>this._pickEntity(e)}
            >
              <span class="stop-name">${i}</span>
              <span class="eid">${s}</span>
            </button>
          `}):F`<div class="editor-hint">${this._et("no_sensors")}</div>`;return F`
      <div class="editor-section">
        <div class="section-header">${this._et("section_sensor")}</div>
        <div class="editor-hint">${this._et("sensor_hint")}</div>
        <div class="entity-chips">${i}</div>
      </div>
    `}_renderDirectionSection(e){const t=this._config,i=t.entity&&!e.has(t.direction);return F`
      <div class="editor-section">
        <div class="section-header">${this._et("section_direction")}</div>
        <div class="editor-hint">${this._et("direction_hint")}</div>
        <div class="direction-buttons">
          <button
            type="button"
            class=${me({active:"H"===t.direction,"no-data":!e.has("H")})}
            @click=${()=>this._setDirection("H")}
          >${this._t("dir_h")}</button>
          <button
            type="button"
            class=${me({active:"R"===t.direction,"no-data":!e.has("R")})}
            @click=${()=>this._setDirection("R")}
          >${this._t("dir_r")}</button>
        </div>
        ${i?F`<div class="direction-warning">${this._et("direction_no_data")}</div>`:K}
      </div>
    `}_renderLineSection(){const e=this._config,t=this._linesForCurrent(),i=t.length?t.map(t=>{const i=t===e.line;return F`
            <button
              type="button"
              class=${me({chip:!0,selected:i})}
              @click=${()=>this._pickLine(t)}
            >
              <span class="stop-name">${t}</span>
            </button>
          `}):F`<div class="editor-hint">${this._et("no_lines")}</div>`;return F`
      <div class="editor-section">
        <div class="section-header">${this._et("section_line")}</div>
        <div class="editor-hint">${this._et("line_hint")}</div>
        <div class="entity-chips">${i}</div>
      </div>
    `}_renderWalkTimeSection(){const e=this._config,t=this._attrs(e.entity),i=e.entity?function(e){const t=[],i=new Set;for(const s of e?.departures??[]){const e=Ue(s.line,String(s.direction??""),s.towards);i.has(e)||(i.add(e),t.push({line:s.line,direction:String(s.direction??""),towards:s.towards,type:s.type}))}return t.sort((e,t)=>e.line===t.line?e.towards.localeCompare(t.towards):e.line.localeCompare(t.line)),t}(t).filter(t=>t.direction===e.direction):[],s=e.walk_times??{};return F`
      <div class="editor-section">
        <div class="section-header">${this._et("section_walk_time")}</div>
        <div class="editor-hint">${this._et("walk_time_hint")}</div>
        <div class="walk-time-list">
          ${i.length?i.map(e=>{const t=Ue(e.line,e.direction,e.towards),i=s[t];return F`
                  <div class="walk-time-row">
                    <span class="walk-time-badge">${e.line}</span>
                    <span class="walk-time-towards" title=${e.towards}>→ ${e.towards}</span>
                    <input
                      type="number"
                      class="walk-time-input"
                      min="0"
                      max="120"
                      step="1"
                      inputmode="numeric"
                      placeholder=${this._et("walk_time_placeholder")}
                      .value=${void 0!==i?String(i):""}
                      @keydown=${this._swallowKeys}
                      @keyup=${this._swallowKeys}
                      @keypress=${this._swallowKeys}
                      @change=${e=>this._setWalkTime(t,e.target.value)}
                    />
                  </div>
                `}):F`<div class="editor-hint">${this._et("walk_time_no_data")}</div>`}
        </div>
      </div>
    `}_renderStationSection(e,t){return F`
      <div class="editor-section">
        <div class="section-header">${this._et("section_station")}</div>
        <div class="editor-hint">${this._et("station_hint")}</div>
        <div class="toggle-row">
          <label for="retro-show-station">${this._et("show_station_name")}</label>
          <ha-switch
            id="retro-show-station"
            .checked=${e}
            @change=${e=>this._setShowStationName(e.target.checked)}
          ></ha-switch>
        </div>
        ${e?F`
              <div class="segmented-row">
                <span class="segmented-label">${this._et("station_bg_label")}</span>
                <div class="direction-buttons">
                  ${De.map(e=>F`
                      <button
                        type="button"
                        class=${me({active:t===e})}
                        @click=${()=>this._setStationBg(e)}
                      >${this._et(`station_bg_${e}`)}</button>
                    `)}
                </div>
              </div>
            `:K}
      </div>
    `}_renderDisplaySection(e,t){return F`
      <div class="editor-section">
        <div class="section-header">${this._et("section_display")}</div>
        <div class="toggle-row">
          <label for="retro-show-platform">${this._et("show_platform")}</label>
          <ha-switch
            id="retro-show-platform"
            .checked=${e}
            @change=${e=>this._setShowPlatform(e.target.checked)}
          ></ha-switch>
        </div>
        <div class="segmented-row">
          <span class="segmented-label">${this._et("size_label")}</span>
          <div class="direction-buttons">
            ${Te.map(e=>F`
                <button
                  type="button"
                  class=${me({active:t===e})}
                  @click=${()=>this._setSize(e)}
                >${this._et(`size_${e}`)}</button>
              `)}
          </div>
        </div>
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
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      color: var(--secondary-text-color);
    }
    .editor-hint {
      font-size: 12px;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }
    .entity-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 16px;
      font-size: 13px;
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
      font-size: 11px;
      opacity: 0.7;
    }
    .direction-buttons {
      display: inline-flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .direction-buttons button {
      padding: 6px 16px;
      border-radius: 16px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 13px;
      cursor: pointer;
      min-width: 48px;
    }
    .direction-buttons button.active {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color);
    }
    .direction-buttons button.no-data {
      opacity: 0.45;
    }
    .direction-warning {
      margin-top: 4px;
      font-size: 12px;
      color: var(--warning-color, #ffa000);
    }
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .toggle-row label {
      font-size: 13px;
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .segmented-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 4px;
      flex-wrap: wrap;
    }
    .segmented-label {
      font-size: 13px;
      color: var(--primary-text-color);
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
      font-size: 13px;
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
      font-size: 13px;
      text-align: right;
    }
  `}};e([pe({attribute:!1})],je.prototype,"hass",void 0),e([ue()],je.prototype,"_config",void 0),je=e([de("wiener-linien-austria-retro-card-editor")],je),console.info(`%c WIENER-LINIEN-AUSTRIA-RETRO-CARD %c ${we} `,"color: #FFC700; background: #000; font-weight: 700;","color: #000; background: #FFC700; font-weight: 700;"),window.customCards=window.customCards??[],window.customCards.push({type:"wiener-linien-austria-retro-card",name:"Wiener Linien Austria — Retro",description:"LED-Anzeige im Stil der Wiener-Linien-Stationen",preview:!0});let We=class extends ae{constructor(){super(...arguments),this._versionMismatch=null,this._versionCheckDone=!1}setConfig(e){if(!e||"object"!=typeof e)throw new Error("wiener-linien-austria-retro-card: config must be an object");this._config=Ne(e)}getCardSize(){return 2}static getConfigElement(){return document.createElement("wiener-linien-austria-retro-card-editor")}static getStubConfig(e){const t=Me(e)[0]||"";let i="H";const s=e?.states?.[t]?.attributes?.departures;if(Array.isArray(s)){const e=s.some(e=>"H"===e.direction),t=s.some(e=>"R"===e.direction);!e&&t&&(i="R")}return{type:"custom:wiener-linien-austria-retro-card",entity:t,direction:i,size:"small"}}connectedCallback(){super.connectedCallback(),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion())}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_versionMismatch"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._resolveEntity();return!!i&&t.states[i]!==this.hass.states[i]}_lang(){return this.hass?.language?.startsWith("de")?"de":"en"}_t(e,t){return He(`retro.${e}`,{hassLanguage:this.hass?.language},t)}async _checkCardVersion(){try{const e=await this.hass.callWS({type:"wiener_linien_austria/retro_card_version"});e?.version&&e.version!==we&&(this._versionMismatch=e.version)}catch{}}_resolveEntity(){if(this._config?.entity&&this.hass?.states?.[this._config.entity])return this._config.entity;return Me(this.hass)[0]??null}render(){if(!this._config)return K;const e=this._config,t=this._resolveEntity(),i=t?this.hass?.states?.[t]?.attributes??{}:{},s=Array.isArray(i.departures)?i.departures:[],r=function(e,t){const{lines:i,direction:s,walk_times:r}=t,n=i&&i.length?new Set(i):null;return e.filter(e=>{if(n&&!n.has(e.line))return!1;if(s&&e.direction!==s)return!1;if(r){const t=r[Ue(e.line,String(e.direction??""),e.towards)];if("number"==typeof t&&e.countdown<t)return!1}return!0})}(s,{direction:e.direction,lines:e.line?[e.line]:void 0,walk_times:e.walk_times}),n=r.slice(0,2),o=n.find(e=>e.platform)?.platform??null,a=e.show_platform?o:null,l="2"===a,d=n[0]?.type??"",c="ptBusCity"===d||"ptBusNight"===d,h=this._t(c?"steig":"gleis"),p=i.stop_name||i.friendly_name||"",u=e.show_station_name&&!!p?this._renderStationName(p,r,s,e.station_bg):K,_={retro:!0,"retro--gleis-left":!!a&&l,"retro--gleis-right":!!a&&!l,"retro--no-gleis":!a,[`retro--size-${e.size}`]:"regular"!==e.size};return F`
      <ha-card style="background:#000;padding:0;overflow:hidden;">
        <div class=${me(_)}>
          ${this._versionMismatch?this._renderBanner():K}
          ${u}
          <div class="retro-main">
            ${this._renderMain(t,n,r,s,a,h)}
          </div>
        </div>
      </ha-card>
    `}_renderMain(e,t,i,s,r,n){if(!e)return F`<div class="retro-empty">${this._t("no_entity")}</div>`;if(0===t.length){const e=this._config.direction,t=this._config.line,i=s.filter(t=>t.direction===e);let r="no_data";return s.length>0&&0===i.length?r="no_data_wrong_direction":t&&i.length>0&&(r="no_data_wrong_line"),F`<div class="retro-empty">${this._t(r)}</div>`}return F`
      <div class="retro-rows">
        ${t.map(e=>this._renderRow(e))}
      </div>
      ${r?this._renderGleis(r,n):K}
    `}_renderRow(e){const t=Number.isFinite(e.countdown)?e.countdown:null,i=null!==t&&t<=0;return F`
      <div class="retro-row">
        <div class="retro-line">${e.line||"?"}</div>
        <div class="retro-dest">
          <span class="retro-dest-text">${e.towards||""}</span>
          ${e.barrier_free?F`<ha-icon
                class="retro-wheelchair"
                icon="mdi:wheelchair-accessibility"
                title="Barrierefrei"
              ></ha-icon>`:K}
        </div>
        <div class="retro-cd">
          ${null===t?"--":i?F`<span class="retro-stars"><span>*</span><span>*</span></span>`:String(t)}
        </div>
      </div>
    `}_renderGleis(e,t){return F`
      <div class="retro-gleis">
        <div class="retro-gleis-label">${t}</div>
        <div class="retro-gleis-number">${e}</div>
      </div>
    `}_renderStationName(e,t,i,s){const r=(t.length?t:i).find(e=>"ptMetro"===e.type),n=r?.line;let o,a;return"white"===s?(o="#fff",a="#000"):"black"===s?(o="#000",a="#fff"):n?(o=$e[n.toUpperCase()]??"var(--primary-color)",a="#fff"):(o="#fff",a="#000"),F`
      <div class="retro-station" style=${ye({background:o,color:a})}>
        <div class="retro-station-name">${e}</div>
      </div>
    `}_renderBanner(){const e=this._t("version_update",{v:this._versionMismatch??""});return F`
      <div class="retro-banner">
        <span>${e}</span>
        <button type="button" @click=${this._reload}>${this._t("version_reload")}</button>
      </div>
    `}async _reload(){try{if(window.caches?.keys){const e=await window.caches.keys();await Promise.all(e.map(e=>window.caches.delete(e)))}}catch{}window.location.reload()}static{this.styles=o`
    :host {
      display: block;
      --led-amber: #FFC700;
      --led-bg: #000;
      --led-substrate: #1a0d2a;
    }
    .retro {
      position: relative;
      display: flex;
      flex-direction: column;
      background: var(--led-bg);
      background-image: radial-gradient(
        circle, var(--led-substrate) 0.5px, transparent 1px
      );
      background-size: 4px 4px;
      padding: 14px 22px;
      font-family: 'Courier New', Courier, 'Lucida Console', Monaco, monospace;
      font-weight: 700;
      letter-spacing: 0.08em;
      overflow: hidden;
      border-radius: var(--ha-card-border-radius, 12px);
      min-height: 110px;
    }
    .retro-main {
      display: flex;
      align-items: stretch;
      flex: 1;
    }
    .retro--gleis-left .retro-gleis { order: -1; }
    .retro--gleis-right { padding-right: 14px; }
    .retro--gleis-left { padding-left: 14px; }
    .retro-rows {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 8px;
      color: var(--led-amber);
      text-shadow: 0 0 6px rgba(255, 199, 0, 0.7);
      font-size: 1.9em;
      line-height: 1;
    }
    .retro-row {
      display: grid;
      grid-template-columns: 2.5em 1fr auto;
      align-items: baseline;
      gap: 12px;
      white-space: nowrap;
    }
    .retro-line {
      font-weight: 400;
      text-align: left;
    }
    .retro-dest {
      display: flex;
      align-items: baseline;
      gap: 0.35em;
      overflow: hidden;
      text-transform: uppercase;
      min-width: 0;
    }
    .retro-dest-text {
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 0 1 auto;
      min-width: 0;
    }
    .retro-wheelchair {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      --mdc-icon-size: 1em;
      color: inherit;
      filter: drop-shadow(0 0 4px rgba(255, 199, 0, 0.7));
      transform: translateY(0.18em);
    }
    .retro-cd {
      font-variant-numeric: tabular-nums;
      text-align: right;
      min-width: 2.5em;
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
    .retro-gleis {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 14px 0 18px;
      margin-left: 12px;
      color: var(--led-amber);
      text-shadow: 0 0 6px rgba(255, 199, 0, 0.7);
      border-left: 1px solid rgba(255, 199, 0, 0.25);
    }
    .retro--gleis-left .retro-gleis {
      padding: 0 18px 0 14px;
      margin-left: 0;
      margin-right: 12px;
      border-left: none;
      border-right: 1px solid rgba(255, 199, 0, 0.25);
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

    /* ---- size variants ---- */
    .retro--size-medium {
      padding: 11px 18px;
      min-height: 92px;
    }
    .retro--size-medium.retro--gleis-right { padding-right: 10px; }
    .retro--size-medium.retro--gleis-left { padding-left: 10px; }
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
      padding: 8px 14px;
      min-height: 72px;
    }
    .retro--size-small.retro--gleis-right { padding-right: 6px; }
    .retro--size-small.retro--gleis-left { padding-left: 6px; }
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
      text-shadow: 0 0 6px rgba(255, 199, 0, 0.7);
      font-size: 1.4em;
      padding: 20px 0;
      letter-spacing: 2px;
    }
    .retro-station {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      margin: -14px -22px 10px;
      padding: 11px 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                   Helvetica, Arial, sans-serif;
      font-weight: 700;
      letter-spacing: 0.01em;
      line-height: 1.05;
      font-size: 1.95em;
      border-radius: var(--ha-card-border-radius, 12px)
                     var(--ha-card-border-radius, 12px) 0 0;
    }
    .retro-station-name {
      text-shadow: none;
    }
    .retro--size-medium .retro-station {
      margin: -11px -18px 8px;
      padding: 9px 14px;
      font-size: 1.65em;
    }
    .retro--size-small .retro-station {
      margin: -8px -14px 6px;
      padding: 7px 10px;
      font-size: 1.35em;
    }
    .retro--gleis-right .retro-station { margin-right: -14px; }
    .retro--gleis-left .retro-station { margin-left: -14px; }
    .retro--size-medium.retro--gleis-right .retro-station { margin-right: -10px; }
    .retro--size-medium.retro--gleis-left .retro-station { margin-left: -10px; }
    .retro--size-small.retro--gleis-right .retro-station { margin-right: -6px; }
    .retro--size-small.retro--gleis-left .retro-station { margin-left: -6px; }
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
  `}};e([pe({attribute:!1})],We.prototype,"hass",void 0),e([ue()],We.prototype,"_config",void 0),e([ue()],We.prototype,"_versionMismatch",void 0),We=e([de("wiener-linien-austria-retro-card")],We);export{We as WienerLinienAustriaRetroCard};

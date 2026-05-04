// Wiener Linien Austria — bundled by Rollup. Edit sources in src/, then `npm run build`.
function e(e,t,i,r){var n,s=arguments.length,o=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(o=(s<3?n(o):s>3?n(t,i,o):n(t,i))||o);return s>3&&o&&Object.defineProperty(t,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),n=new WeakMap;let s=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=n.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(t,e))}return e}toString(){return this.cssText}};const o=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[r+1],e[0]);return new s(i,e,r)},a=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new s("string"==typeof e?e:e+"",void 0,r))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:h,getOwnPropertyNames:d,getOwnPropertySymbols:u,getPrototypeOf:p}=Object,_=globalThis,f=_.trustedTypes,g=f?f.emptyScript:"",m=_.reactiveElementPolyfillSupport,b=(e,t)=>e,w={toAttribute(e,t){switch(t){case Boolean:e=e?g:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},y=(e,t)=>!l(e,t),v={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=v){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);void 0!==r&&c(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:n}=h(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){const s=r?.call(this);n?.call(this,t),this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??v}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const e=p(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const e=this.properties,t=[...d(e),...u(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,r)=>{if(i)e.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of r){const r=document.createElement("style"),n=t.litNonce;void 0!==n&&r.setAttribute("nonce",n),r.textContent=i.cssText,e.appendChild(r)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(void 0!==r&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:w).toAttribute(t,i.type);this._$Em=e,null==n?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(void 0!==r&&this._$Em!==r){const e=i.getPropertyOptions(r),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:w;this._$Em=r;const s=n.fromAttribute(t,e.type);this[r]=s??this._$Ej?.get(r)??s,this._$Em=null}}requestUpdate(e,t,i,r=!1,n){if(void 0!==e){const s=this.constructor;if(!1===r&&(n=this[e]),i??=s.getPropertyOptions(e),!((i.hasChanged??y)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:n},s){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),!0!==n||void 0!==s)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,r=this[t];!0!==e||this._$AL.has(t)||void 0===r||this.C(t,void 0,i,r)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[b("elementProperties")]=new Map,x[b("finalized")]=new Map,m?.({ReactiveElement:x}),(_.reactiveElementVersions??=[]).push("2.1.2");const $=globalThis,k=e=>e,A=$.trustedTypes,S=A?A.createPolicy("lit-html",{createHTML:e=>e}):void 0,z="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,R="?"+E,C=`<${R}>`,T=document,M=()=>T.createComment(""),L=e=>null===e||"object"!=typeof e&&"function"!=typeof e,D=Array.isArray,P="[ \t\n\f\r]",H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,q=/>/g,N=RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,U=/"/g,W=/^(?:script|style|textarea|title)$/i,j=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),F=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),I=new WeakMap,V=T.createTreeWalker(T,129);function G(e,t){if(!D(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(t):t}const Q=(e,t)=>{const i=e.length-1,r=[];let n,s=2===t?"<svg>":3===t?"<math>":"",o=H;for(let t=0;t<i;t++){const i=e[t];let a,l,c=-1,h=0;for(;h<i.length&&(o.lastIndex=h,l=o.exec(i),null!==l);)h=o.lastIndex,o===H?"!--"===l[1]?o=O:void 0!==l[1]?o=q:void 0!==l[2]?(W.test(l[2])&&(n=RegExp("</"+l[2],"g")),o=N):void 0!==l[3]&&(o=N):o===N?">"===l[0]?(o=n??H,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?N:'"'===l[3]?U:B):o===U||o===B?o=N:o===O||o===q?o=H:(o=N,n=void 0);const d=o===N&&e[t+1].startsWith("/>")?" ":"";s+=o===H?i+C:c>=0?(r.push(a),i.slice(0,c)+z+i.slice(c)+E+d):i+E+(-2===c?t:d)}return[G(e,s+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),r]};class Z{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let n=0,s=0;const o=e.length-1,a=this.parts,[l,c]=Q(e,t);if(this.el=Z.createElement(l,i),V.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(r=V.nextNode())&&a.length<o;){if(1===r.nodeType){if(r.hasAttributes())for(const e of r.getAttributeNames())if(e.endsWith(z)){const t=c[s++],i=r.getAttribute(e).split(E),o=/([.?@])?(.*)/.exec(t);a.push({type:1,index:n,name:o[2],strings:i,ctor:"."===o[1]?te:"?"===o[1]?ie:"@"===o[1]?re:ee}),r.removeAttribute(e)}else e.startsWith(E)&&(a.push({type:6,index:n}),r.removeAttribute(e));if(W.test(r.tagName)){const e=r.textContent.split(E),t=e.length-1;if(t>0){r.textContent=A?A.emptyScript:"";for(let i=0;i<t;i++)r.append(e[i],M()),V.nextNode(),a.push({type:2,index:++n});r.append(e[t],M())}}}else if(8===r.nodeType)if(r.data===R)a.push({type:2,index:n});else{let e=-1;for(;-1!==(e=r.data.indexOf(E,e+1));)a.push({type:7,index:n}),e+=E.length-1}n++}}static createElement(e,t){const i=T.createElement("template");return i.innerHTML=e,i}}function J(e,t,i=e,r){if(t===F)return t;let n=void 0!==r?i._$Co?.[r]:i._$Cl;const s=L(t)?void 0:t._$litDirective$;return n?.constructor!==s&&(n?._$AO?.(!1),void 0===s?n=void 0:(n=new s(e),n._$AT(e,i,r)),void 0!==r?(i._$Co??=[])[r]=n:i._$Cl=n),void 0!==n&&(t=J(e,n._$AS(e,t.values),n,r)),t}class Y{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??T).importNode(t,!0);V.currentNode=r;let n=V.nextNode(),s=0,o=0,a=i[0];for(;void 0!==a;){if(s===a.index){let t;2===a.type?t=new X(n,n.nextSibling,this,e):1===a.type?t=new a.ctor(n,a.name,a.strings,this,e):6===a.type&&(t=new ne(n,this,e)),this._$AV.push(t),a=i[++o]}s!==a?.index&&(n=V.nextNode(),s++)}return V.currentNode=T,r}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),L(e)?e===K||null==e||""===e?(this._$AH!==K&&this._$AR(),this._$AH=K):e!==this._$AH&&e!==F&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>D(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==K&&L(this._$AH)?this._$AA.nextSibling.data=e:this.T(T.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Z.createElement(G(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const e=new Y(r,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=I.get(e.strings);return void 0===t&&I.set(e.strings,t=new Z(e)),t}k(e){D(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const n of e)r===t.length?t.push(i=new X(this.O(M()),this.O(M()),this,this.options)):i=t[r],i._$AI(n),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ee{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,n){this.type=1,this._$AH=K,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=K}_$AI(e,t=this,i,r){const n=this.strings;let s=!1;if(void 0===n)e=J(this,e,t,0),s=!L(e)||e!==this._$AH&&e!==F,s&&(this._$AH=e);else{const r=e;let o,a;for(e=n[0],o=0;o<n.length-1;o++)a=J(this,r[i+o],t,o),a===F&&(a=this._$AH[o]),s||=!L(a)||a!==this._$AH[o],a===K?e=K:e!==K&&(e+=(a??"")+n[o+1]),this._$AH[o]=a}s&&!r&&this.j(e)}j(e){e===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===K?void 0:e}}class ie extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==K)}}class re extends ee{constructor(e,t,i,r,n){super(e,t,i,r,n),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??K)===F)return;const i=this._$AH,r=e===K&&i!==K||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==K&&(i===K||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const se=$.litHtmlPolyfillSupport;se?.(Z,X),($.litHtmlVersions??=[]).push("3.3.2");const oe=globalThis;let ae=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const r=i?.renderBefore??t;let n=r._$litPart$;if(void 0===n){const e=i?.renderBefore??null;r._$litPart$=n=new X(t.insertBefore(M(),e),e,void 0,i??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}};ae._$litElement$=!0,ae.finalized=!0,oe.litElementHydrateSupport?.({LitElement:ae});const le=oe.litElementPolyfillSupport;le?.({LitElement:ae}),(oe.litElementVersions??=[]).push("4.2.2");const ce=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},he={attribute:!0,type:String,converter:w,reflect:!1,hasChanged:y},de=(e=he,t,i)=>{const{kind:r,metadata:n}=i;let s=globalThis.litPropertyMetadata.get(n);if(void 0===s&&globalThis.litPropertyMetadata.set(n,s=new Map),"setter"===r&&((e=Object.create(e)).wrapped=!0),s.set(i.name,e),"accessor"===r){const{name:r}=i;return{set(i){const n=t.get.call(this);t.set.call(this,i),this.requestUpdate(r,n,e,!0,i)},init(t){return void 0!==t&&this.C(r,void 0,e,t),t}}}if("setter"===r){const{name:r}=i;return function(i){const n=this[r];t.call(this,i),this.requestUpdate(r,n,e,!0,i)}}throw Error("Unsupported decorator location: "+r)};function ue(e){return(t,i)=>"object"==typeof i?de(e,t,i):((e,t,i)=>{const r=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),r?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function pe(e){return ue({...e,state:!0,attribute:!1})}const _e=1,fe=e=>(...t)=>({_$litDirective$:e,values:t});let ge=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const me=fe(class extends ge{constructor(e){if(super(e),e.type!==_e||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e)));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const i=e.element.classList;for(const e of this.st)e in t||(i.remove(e),this.st.delete(e));for(const e in t){const r=!!t[e];r===this.st.has(e)||this.nt?.has(e)||(r?(i.add(e),this.st.add(e)):(i.remove(e),this.st.delete(e)))}return F}}),be={},we=fe(class extends ge{constructor(){super(...arguments),this.key=K}render(e,t){return this.key=e,t}update(e,[t,i]){return t!==this.key&&(((e,t=be)=>{e._$AH=t})(e),this.key=t),i}}),ye="important",ve=" !"+ye,xe=fe(class extends ge{constructor(e){if(super(e),e.type!==_e||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,i)=>{const r=e[i];return null==r?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?i.removeProperty(e):i[e]=null);for(const e in t){const r=t[e];if(null!=r){this.ft.add(e);const t="string"==typeof r&&r.endsWith(ve);e.includes("-")||t?i.setProperty(e,t?r.slice(0,-11):r,t?ye:""):i[e]=r}}return F}});function $e(e,t){return e?j`<span lang="de">${e}</span>`:t??""}function ke(e,t,i){e.dispatchEvent(new CustomEvent(t,{detail:i,bubbles:!0,composed:!0}))}var Ae={no_data:"Keine Abfahrten verfügbar",betriebsschluss:"Betriebsschluss",min:"Min",now:"Jetzt",platform_short_rail:"Gleis",platform_short_bus:"Steig",version_update:"Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",no_entities_picked:"Keine Haltestelle ausgewählt",no_entities_available:"Keine Wiener-Linien-Sensoren gefunden",departures_list:"Kommende Abfahrten",barrier_free_title:"Barrierefrei zugänglich",disturbance_title:"Verkehrsbehinderung gemeldet",stops_ahead_aria_show:"Streckenverlauf für {line} Richtung {towards} anzeigen",stops_ahead_aria_hide:"Streckenverlauf für {line} Richtung {towards} ausblenden",stops_ahead_transfer_aria:"Umsteigen auf {lines}",stops_ahead_other_show:"{count} weitere Linien bei {stop} anzeigen",stops_ahead_other_hide:"Weitere Linien bei {stop} ausblenden",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",dir_both:"Beide",traffic_label:"Störung",traffic_until:"Bis",traffic_updated:"aktualisiert",elevator_label:"Aufzug außer Betrieb",elevator_until:"Bis",open_in_maps:"In Karte öffnen",qr_open:"QR-Code anzeigen",qr_dialog_title:"QR-Code für Haltestelle",qr_dialog_hint:"Mit dem Smartphone scannen — öffnet die Haltestelle in der Karten-App.",delay_singular:"1 Min. verspätet",delay_plural:"{n} Min. verspätet",devmode_title:"DEV",devmode_traffic_btn:"Test Störung",devmode_elevator_btn:"Test Aufzug",devmode_clear_btn:"Löschen",editor:{lines_label:"Linien",direction_label:"Richtung",per_line_direction_label:"Richtung pro Linie",per_line_direction_hint:"Optional: Richtung pro Linie einzeln festlegen. Beide = haltestellenweite Richtung oben verwenden.",per_line_direction_aria:"Richtung für Linie {line}",direction_unavailable:"Keine Abfahrten in dieser Richtung",walk_time_label:"Fußweg (min)",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis du dort bist. Leer lassen = kein Filter.",walk_time_branching_hint:"Gilt für alle Endstationen in dieser Richtung",walk_time_placeholder:"–",walk_time_aria:"Fußweg in Minuten für Linie {line} Richtung {towards}",section_colors:"Linienfarben",colors_hint:"Optional: Farben überschreiben. U-Bahn-Standardwerte sind gesetzt.",reset_color:"Zurücksetzen",pick_color_for_line:"Farbe für Linie {line} wählen",section_display:"Anzeige",max_departures:"Anzahl Abfahrten pro Haltestelle",show_accessibility:"Barrierefrei-Symbol anzeigen",accessibility_only:"Nur barrierefreie Abfahrten anzeigen",show_type_icon:"Verkehrsmittel-Symbol anzeigen",show_platform:"Steig/Gleis anzeigen",show_traffic_info:"Störungen anzeigen",show_elevator_info:"Aufzugsinfo anzeigen",show_delay:"Verspätungen anzeigen",show_hero_metric:"Hauptbereich anzeigen",show_departures:"Abfahrtsliste anzeigen",show_stops_ahead:"Zwischenstopps anzeigen",show_qr_button:"QR-Code-Button anzeigen",hide_header:"Kopfzeile ausblenden",hide_attribution:"Datenquelle ausblenden",layout:"Layout mehrerer Haltestellen",layout_stacked:"Gestapelt",layout_tabs:"Reiter",no_lines_available:"Linien erscheinen hier, sobald Haltestellen ausgewählt wurden."}},Se={no_entity:"Keine Haltestelle ausgewählt",no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",betriebsschluss:"Betriebsschluss",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",gleis:"GLEIS",steig:"STEIG",version_update:"Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",departures_list:"Kommende Abfahrten",at_platform:"Einfahrt",countdown_minutes:"{n} Minuten",race_finished:"Barrierefreiheits-Rennen beendet",race_starting_in:"Rennen startet in {n}",race_winner_announce:"Rollstuhl {n} gewinnt das Barrierefreiheits-Rennen",barrier_free_title:"Barrierefrei zugänglich",editor:{direction:"Richtung",line:"Linie",size:"Größe",style:"Stil",station_bg:"Hintergrund",section_display:"Darstellung",section_walk_time:"Fußweg zur Haltestelle",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis du dort bist. Leer lassen = kein Filter.",walk_time_branching_hint:"Gilt für alle Endstationen in dieser Richtung",walk_time_no_data:"Keine Abfahrten in dieser Richtung. Richtung wechseln oder warten, bis der Sensor Linien meldet.",walk_time_placeholder:"–",walk_time_aria:"Fußweg in Minuten für Linie {line} Richtung {towards}",show_platform:"Gleis/Steig anzeigen",show_station_name:"Stationsnamen anzeigen",section_station:"Stationsnamen-Schild",station_bg_default:"Standard",station_bg_white:"Weiß",station_bg_black:"Schwarz",size_small:"Klein",size_medium:"Mittel",size_regular:"Normal",style_classic:"Klassisch",style_warm:"Warm",style_pixel:"Punktmatrix",accessibility_only:"Nur barrierefreie Abfahrten anzeigen",flicker:"Linien-Flimmern",wheelchair_race:"Rollstuhl-Rennen"}},ze={modern:Ae,retro:Se},Ee={no_data:"No departures available",betriebsschluss:"End of service",min:"min",now:"Now",platform_short_rail:"Track",platform_short_bus:"Bay",version_update:"Wiener Linien Austria updated to v{v} — please reload",version_reload:"Reload",no_entities_picked:"No stop selected",no_entities_available:"No Wiener Linien sensors found",departures_list:"Upcoming departures",barrier_free_title:"Step-free access",disturbance_title:"Traffic disruption reported",stops_ahead_aria_show:"Show stops ahead for {line} towards {towards}",stops_ahead_aria_hide:"Hide stops ahead for {line} towards {towards}",stops_ahead_transfer_aria:"Change to {lines}",stops_ahead_other_show:"Show {count} more lines at {stop}",stops_ahead_other_hide:"Hide other lines at {stop}",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",dir_both:"Both",traffic_label:"Disruption",traffic_until:"Until",traffic_updated:"updated",elevator_label:"Elevator out of service",elevator_until:"Until",open_in_maps:"Open in maps",qr_open:"Show QR code",qr_dialog_title:"QR code for stop",qr_dialog_hint:"Scan with your phone — opens the stop in your maps app.",delay_singular:"1 min. late",delay_plural:"{n} min. late",devmode_title:"DEV",devmode_traffic_btn:"Test disruption",devmode_elevator_btn:"Test elevator",devmode_clear_btn:"Clear",editor:{lines_label:"Lines",direction_label:"Direction",per_line_direction_label:"Per-line direction",per_line_direction_hint:"Optional: pick the direction for each line individually. Both = use the stop-wide direction above.",per_line_direction_aria:"Direction for line {line}",direction_unavailable:"No departures in this direction",walk_time_label:"Walking time (min)",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_branching_hint:"Applies to all termini in this direction",walk_time_placeholder:"–",walk_time_aria:"Walk time in minutes for line {line} towards {towards}",section_colors:"Line colours",colors_hint:"Optional overrides. Metro defaults are already set.",reset_color:"Reset",pick_color_for_line:"Pick colour for line {line}",section_display:"Display",max_departures:"Departures per stop",show_accessibility:"Show step-free icon",accessibility_only:"Only show step-free departures",show_type_icon:"Show vehicle-type icon",show_platform:"Show platform / track",show_traffic_info:"Show disruption alerts",show_elevator_info:"Show elevator outages",show_delay:"Show delays",show_hero_metric:"Show hero block",show_departures:"Show departure list",show_stops_ahead:"Show intermediate stops",show_qr_button:"Show QR-code button",hide_header:"Hide header",hide_attribution:"Hide data source",layout:"Multi-stop layout",layout_stacked:"Stacked",layout_tabs:"Tabs",no_lines_available:"Lines appear here once stops are selected."}},Re={no_entity:"No stop selected",no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",betriebsschluss:"End of service",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",gleis:"PLATF.",steig:"STAND",version_update:"Retro card updated to v{v} — please reload",version_reload:"Reload",departures_list:"Upcoming departures",at_platform:"At platform",countdown_minutes:"{n} minutes",race_finished:"Accessibility race finished",race_starting_in:"Race starting in {n}",race_winner_announce:"Wheelchair {n} wins the accessibility race",barrier_free_title:"Step-free access",editor:{direction:"Direction",line:"Line",size:"Size",style:"Style",station_bg:"Station-name background",section_display:"Display",section_walk_time:"Walking time to stop",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_branching_hint:"Applies to all termini in this direction",walk_time_no_data:"No departures in this direction. Switch direction or wait until the sensor reports lines.",walk_time_placeholder:"–",walk_time_aria:"Walk time in minutes for line {line} towards {towards}",show_platform:"Show platform",show_station_name:"Show station name",section_station:"Station name sign",station_bg_default:"Default",station_bg_white:"White",station_bg_black:"Black",size_small:"Small",size_medium:"Medium",size_regular:"Regular",style_classic:"Classic",style_warm:"Warm",style_pixel:"Dot matrix",accessibility_only:"Only show step-free departures",flicker:"Line badge flicker",wheelchair_race:"Wheelchair race"}},Ce={modern:Ee,retro:Re};const Te={de:Object.freeze({__proto__:null,default:ze,modern:Ae,retro:Se}),en:Object.freeze({__proto__:null,default:Ce,modern:Ee,retro:Re})},Me=Te.de??{};function Le(e,t){const i=function(e,t){return e.split(".").reduce((e,t)=>{if(e&&"object"==typeof e&&t in e)return e[t]},t)}(e,t);return"string"==typeof i?i:void 0}function De(e,t,i){const r=function(e){return"en"===((e.configLanguage||e.hassLanguage||"de").replace("-","_").split("_")[0]??"de")?"en":"de"}(t);let n=Le(e,Te[r]??Me);if(void 0===n&&(n=Le(e,Me)),void 0===n)return e;if(i)for(const[e,t]of Object.entries(i))n=n.replace(`{${e}}`,String(t));return n}function Pe(){try{window.caches?.keys?.().then(e=>{e.forEach(e=>window.caches?.delete?.(e))})}catch{}window.location.reload()}function He(e,t,i="banner"){if(!e)return K;const r=t("version_update").replace("{v}",e),n=t("version_reload");return j`
    <div class=${i} role="alert" aria-live="assertive">
      <span>${r}</span>
      <button
        type="button"
        aria-label=${n}
        @click=${Pe}
      >
        ${n}
      </button>
    </div>
  `}const Oe=new Set(["small","medium","regular"]),qe=new Set(["default","white","black"]),Ne=new Set(["classic","warm","pixel"]);function Be(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,r]of Object.entries(e)){const e="number"==typeof r?r:"string"==typeof r?Number(r):NaN;if(!Number.isFinite(e))continue;if(e<0||e>120)continue;const n=i.split("|"),s=n.length>=3?`${n[0]}|${n[1]}`:i,o=Math.round(e),a=t[s];t[s]=void 0===a?o:Math.max(a,o)}return Object.keys(t).length?t:void 0}function Ue(e){const t="R"===e.direction?"R":"H",i=Oe.has(e.size)?e.size:"regular",r=qe.has(e.station_bg)?e.station_bg:"default",n=Ne.has(e.style)?e.style:"classic";return{...e,type:e.type||"custom:wiener-linien-austria-retro-card",entity:"string"==typeof e.entity&&e.entity.startsWith("sensor.")?e.entity:void 0,direction:t,line:"string"==typeof e.line&&e.line?e.line:void 0,show_platform:e.show_platform??!0,show_station_name:e.show_station_name??!1,station_bg:r,size:i,style:n,flicker:!0===e.flicker,wheelchair_race:!0===e.wheelchair_race,accessibility_only:!0===e.accessibility_only,walk_times:Be(e.walk_times)}}function We(e,t){return`${e}|${t}`}function je(e,t){if(!e)return[];const i=new Set;if(e.tracked_line_keys?.length){for(const r of e.tracked_line_keys){const[e,n]=r.split("|",2);e&&(t&&n!==t||i.add(e))}if(i.size>0)return[...i].sort()}for(const r of e.departures??[])t&&r.direction!==t||r.line&&i.add(r.line);return[...i].sort()}function Fe(e,t){const{lines:i,direction:r,line_directions:n,walk_times:s,accessibility_only:o}=t,a=i&&i.length?new Set(i):null;return e.filter(e=>{if(a&&!a.has(e.line))return!1;const t=n?.[e.line]??r;if(t&&e.direction!==t)return!1;if(s){const t=s[We(e.line,String(e.direction??""))];if("number"==typeof t&&e.countdown<t)return!1}return!(o&&!e.barrier_free)})}function Ke(e){if(!e)return[];const t=[];for(const[i,r]of Object.entries(e.states??{})){if(!i.startsWith("sensor."))continue;const e=r?.attributes??{};"number"==typeof e.diva&&(Array.isArray(e.departures)&&e.next_by_line&&"object"==typeof e.next_by_line&&t.push(i))}return t.sort(),t}const Ie=[["A","A","B"],["B","B","A"],["A","B","B"],["B","A","A"],["A","B","A"],["B","A","B"]],Ve=[100,250],Ge=[200,500],Qe=[500,900],Ze=[.25,.5,.75],Je=[3,2.5,2.5];function Ye(e){const t=(e,t)=>e+Math.random()*(t-e),i=Math.random()<.5?"A":"B",r=Math.random()<.3?"A"===i?"B":"A":i,n=Ie.filter(e=>e[2]===r),s=n[Math.floor(Math.random()*n.length)],o=Math.random(),a=o<.4?t(Ve[0],Ve[1]):o<.75?t(Ge[0],Ge[1]):t(Qe[0],Qe[1]),l=t(2400,2700),c=l+a,h=l*t(1.08,1.15),d=c*t(1.08,1.15),u="A"===i?h:d,p="B"===i?h:d,_="A"===i?l:c,f="B"===i?l:c,g=e.a,m=e.b,b=e.finishCqw,w=Math.max(g,m),y=Math.max(20,92-w),v=(e,t)=>{const i=w+Ze[t]*y,r=s[t]===e,n=Je[t];return o=.6,i+(r?n:-n)+(2*Math.random()-1)*o;var o},x=v("A",0),$=v("A",1),k=v("A",2),A=v("B",0),S=v("B",1),z=v("B",2),E=(e,t,i)=>{const r=b-i,n=e-.75*t;if(r<=0||n<=1)return Math.max(i+5,102);const s=i+.25*r*t/n;return Math.max(102,Math.min(135,s))},R=E(_,u,k),C=E(f,p,z),T=(e,t,i,r,n,s)=>{const o=[[0,.25,e,t],[.25,.5,t,i],[.5,.75,i,r],[.75,1,r,n]];for(const[e,t,i,r]of o){if(i>=b)return e*s;if(r>=b){return(e+(b-i)/(r-i)*(t-e))*s}}return Number.POSITIVE_INFINITY},M=T(g,x,$,k,R,u),L=T(m,A,S,z,C,p);return{winner:M<=L?"A":"B",winnerCrossT:Math.min(M,L),cssVars:{"--race-a-duration":`${u}ms`,"--race-b-duration":`${p}ms`,"--race-a-end":R-g+"cqw","--race-b-end":C-m+"cqw","--race-a-x-25":x-g+"cqw","--race-a-x-50":$-g+"cqw","--race-a-x-75":k-g+"cqw","--race-b-x-25":A-m+"cqw","--race-b-x-50":S-m+"cqw","--race-b-x-75":z-m+"cqw"}}}const Xe=o`
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
// Schema-driven Lovelace editor for the Wiener Linien Austria retro card.
let et=class extends ae{constructor(){super(...arguments),this._pendingDirectionFix=!1,this._computeLabel=e=>{const t=`ui.panel.lovelace.editor.card.generic.${e.name}`,i=this.hass?.localize?.(t);if(i)return i;const r=this._et(e.name);if(r!==`retro.editor.${e.name}`&&r!==e.name)return r;const n=this._t(e.name);return n!==`retro.${e.name}`&&n!==e.name?n:e.name},this._computeHelper=e=>{const t=`${e.name}_helper`,i=this._et(t);if(i!==`retro.editor.${t}`&&i!==t)return i},this._onFormChanged=e=>{if(!this._config)return;const t=this._config.entity,i=e.detail.value,r=Ue({...this._config,...i});if(r.entity!==t){const e=je(this._attrs(r.entity),r.direction);r.line=e[0]}this._config=r,ke(this,"config-changed",{config:r})}}setConfig(e){this._config=Ue(e)}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._config.entity;return!i||t.states[i]!==this.hass.states[i]}_t(e){return De(`retro.${e}`,{hassLanguage:this.hass?.language})}_et(e){return De(`retro.editor.${e}`,{hassLanguage:this.hass?.language})}_attrs(e){return e?this.hass?.states?.[e]?.attributes:void 0}_linesForCurrent(){return this._config?je(this._attrs(this._config.entity),this._config.direction):[]}_terminiForDirection(e){const t=this._attrs(this._config?.entity);if(!t)return[];const i=this._config?.line,r=new Set;for(const n of t.departures??[])n.direction===e&&n.towards&&(i&&n.line!==i||r.add(n.towards));return[...r].sort()}_directionLabel(e){return function(e,t){if(!e.length)return t.full;const i=e.slice(0,3).join(" / "),r=e.length>3?" +"+(e.length-3):"";return`${t.short}: ${i}${r}`}(this._terminiForDirection(e),{full:this._t("H"===e?"dir_h":"dir_r"),short:this._t("H"===e?"dir_h_short":"dir_r_short")})}_availableDirections(){const e=this._attrs(this._config?.entity),t=new Set;if(e?.tracked_line_keys?.length){for(const i of e.tracked_line_keys){const[,e]=i.split("|",2);"H"!==e&&"R"!==e||t.add(e)}if(t.size>0)return t}for(const i of e?.departures??[])"H"!==i.direction&&"R"!==i.direction||t.add(i.direction);return t}_schema(){const e=this._linesForCurrent(),t=this._config?.line,i=(t&&!e.includes(t)?[t,...e]:e).map(e=>({value:e,label:e})),r=this._availableDirections(),n=[];return(0===r.size||r.has("H"))&&n.push({value:"H",label:this._directionLabel("H")}),(0===r.size||r.has("R"))&&n.push({value:"R",label:this._directionLabel("R")}),[{name:"entity",required:!0,selector:{entity:{domain:"sensor",integration:"wiener_linien_austria"}}},{name:"direction",selector:{select:{mode:"dropdown",options:n}}},{name:"line",selector:{select:{mode:"dropdown",custom_value:!0,options:i}}},{type:"expandable",name:"station",title:this._et("section_station"),flatten:!0,schema:[{name:"show_station_name",selector:{boolean:{}}},{name:"station_bg",selector:{select:{mode:"list",options:[{value:"default",label:this._et("station_bg_default")},{value:"white",label:this._et("station_bg_white")},{value:"black",label:this._et("station_bg_black")}]}}}]},{type:"expandable",name:"display",title:this._et("section_display"),flatten:!0,schema:[{name:"show_platform",selector:{boolean:{}}},{name:"accessibility_only",selector:{boolean:{}}},{name:"flicker",selector:{boolean:{}}},{name:"wheelchair_race",selector:{boolean:{}}},{type:"grid",name:"",schema:[{name:"size",selector:{select:{mode:"list",options:[{value:"small",label:this._et("size_small")},{value:"medium",label:this._et("size_medium")},{value:"regular",label:this._et("size_regular")}]}}},{name:"style",selector:{select:{mode:"list",options:[{value:"classic",label:this._et("style_classic")},{value:"warm",label:this._et("style_warm")},{value:"pixel",label:this._et("style_pixel")}]}}}]}]}]}_formData(){return this._config?{...this._config}:{}}_setWalkTime(e,t){if(!this._config)return;const i=parseInt(t,10),r=Number.isFinite(i)&&i>0?Math.min(120,i):null,n={...this._config.walk_times??{}};null===r?delete n[e]:n[e]=r;const s={...this._config};Object.keys(n).length?s.walk_times=n:delete s.walk_times,this._config=s,ke(this,"config-changed",{config:s})}_swallowKeys(e){e.stopPropagation()}render(){return this._config?(this._scheduleDirectionAutocorrect(),j`
      <div class="editor">
        <ha-form
          .hass=${this.hass}
          .data=${this._formData()}
          .schema=${this._schema()}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${this._onFormChanged}
        ></ha-form>
        ${this._renderWalkTimeSection()}
      </div>
    `):K}_scheduleDirectionAutocorrect(){if(!this._config||this._pendingDirectionFix)return;const e=this._availableDirections();if(1!==e.size)return;const t=e.has("H")?"H":"R";this._config.direction!==t&&(this._pendingDirectionFix=!0,Promise.resolve().then(()=>{if(this._pendingDirectionFix=!1,!this._config)return;const e=this._availableDirections();if(1!==e.size)return;const t=e.has("H")?"H":"R";if(this._config.direction===t)return;const i={...this._config,direction:t};this._config=i,ke(this,"config-changed",{config:i})}))}_renderWalkTimeSection(){const e=this._config,t=this._attrs(e.entity),i=e.entity?function(e){const t=new Map;for(const i of e?.departures??[]){const e=String(i.direction??""),r=We(i.line,e);let n=t.get(r);n||(n={line:i.line,direction:e,type:i.type,termini:[]},t.set(r,n)),i.towards&&!n.termini.includes(i.towards)&&n.termini.push(i.towards)}const i=Array.from(t.values());return i.sort((e,t)=>e.line===t.line?e.direction.localeCompare(t.direction):e.line.localeCompare(t.line)),i}(t).filter(t=>t.direction===e.direction):[],r=e.walk_times??{};return j`
      <div class="editor-section">
        <div class="section-header">${this._et("section_walk_time")}</div>
        <div class="editor-hint">${this._et("walk_time_hint")}</div>
        <div class="walk-time-list">
          ${i.length?i.map(e=>{const t=We(e.line,e.direction),i=r[t],n=e.termini.join(" / "),s=e.termini.length>1?this._et("walk_time_branching_hint"):"";return j`
                  <div class="walk-time-row">
                    <span class="walk-time-badge">${e.line}</span>
                    <span
                      class="walk-time-towards"
                      title=${s||n}
                    >→ ${n}</span>
                    <input
                      type="number"
                      class="walk-time-input"
                      min="0"
                      max="120"
                      step="1"
                      inputmode="numeric"
                      placeholder=${this._et("walk_time_placeholder")}
                      aria-label=${this._et("walk_time_aria").replace("{line}",e.line).replace("{towards}",n)}
                      .value=${void 0!==i?String(i):""}
                      @keydown=${this._swallowKeys}
                      @keyup=${this._swallowKeys}
                      @keypress=${this._swallowKeys}
                      @change=${e=>this._setWalkTime(t,e.target.value)}
                    />
                  </div>
                `}):j`<div class="editor-hint">${this._et("walk_time_no_data")}</div>`}
        </div>
      </div>
    `}static{this.styles=[Xe]}};e([ue({attribute:!1})],et.prototype,"hass",void 0),e([pe()],et.prototype,"_config",void 0),et=e([ce("wiener-linien-austria-retro-card-editor")],et);const tt=800;{const e=window;e.customCards=e.customCards??[],e.customCards.some(e=>"wiener-linien-austria-retro-card"===e.type)||e.customCards.push({type:"wiener-linien-austria-retro-card",name:"Wiener Linien Austria — Retro",description:"LED-Anzeige im Stil der Wiener-Linien-Stationen",preview:!0})}let it=class extends ae{constructor(){super(...arguments),this._versionMismatch=null,this._raceState="idle",this._countdownDigit=null,this._raceWinner=null,this._versionCheckDone=!1,this._fallbackWarned=!1,this._raceTimers=[],this._countdownStartAt=null,this._raceEndAt=null,this._freezeEndAt=null,this._victoryEndAt=null,this._handleCardClick=()=>{this._config?.wheelchair_race&&"idle"===this._raceState&&("undefined"!=typeof window&&window.matchMedia?.("(prefers-reduced-motion: reduce)").matches||(this._clearRaceTimers(),this._startRace()))}}setConfig(e){if(!e||"object"!=typeof e)throw new Error("wiener-linien-austria-retro-card: config must be an object");if(void 0!==e.entity&&"string"!=typeof e.entity)throw new Error("wiener-linien-austria-retro-card: 'entity' must be a string");this._config=Ue(e)}getCardSize(){return 2}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:2}}static getConfigElement(){return document.createElement("wiener-linien-austria-retro-card-editor")}static getStubConfig(e){const t=Ke(e)[0]||"";let i="H";const r=e?.states?.[t]?.attributes?.departures;if(Array.isArray(r)){const e=r.some(e=>"H"===e.direction),t=r.some(e=>"R"===e.direction);!e&&t&&(i="R")}return{entity:t,direction:i,size:"small"}}connectedCallback(){super.connectedCallback(),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion()),"idle"!==this._raceState&&(this._config?.wheelchair_race?this._armStateTransitions():(this._raceState="idle",this._clearRaceTimers()))}disconnectedCallback(){super.disconnectedCallback(),this._clearRaceTimers()}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_versionMismatch")||e.has("_raceState")||e.has("_countdownDigit")||e.has("_raceWinner"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._resolveEntity();return!!i&&t.states[i]!==this.hass.states[i]}updated(e){if(super.updated(e),!e.has("_config"))return;const t=e.get("_config"),i=!0===t?.wheelchair_race,r=!0===this._config?.wheelchair_race;r&&!i?(this._clearRaceTimers(),this._startRace()):!r&&i&&(this._clearRaceTimers(),this._raceState="idle",this._countdownStartAt=null,this._countdownDigit=null,this._raceEndAt=null,this._freezeEndAt=null,this._victoryEndAt=null,this._raceWinner=null)}_lang(){return this.hass?.language?.startsWith("de")?"de":"en"}_t(e,t){return De(`retro.${e}`,{hassLanguage:this.hass?.language},t)}async _checkCardVersion(){this._versionMismatch=await async function(e,t,i){if(!e?.callWS)return null;try{const r=await e.callWS({type:t});if(r?.version&&r.version!==i)return r.version}catch{}return null}(this.hass,"wiener_linien_austria/retro_card_version","1.4.1")}_resolveEntity(){if(this._config?.entity&&this.hass?.states?.[this._config.entity])return this._config.entity;const e=Ke(this.hass)[0]??null;return e&&this._config?.entity&&!this._fallbackWarned&&(this._fallbackWarned=!0,console.warn(`[wiener-linien-austria-retro-card] configured entity "${this._config.entity}" not in hass.states; falling back to "${e}"`)),e}_clearRaceTimers(){for(const e of this._raceTimers)clearTimeout(e);this._raceTimers=[]}_scheduleRaceTimer(e,t){const i=setTimeout(()=>{const t=this._raceTimers.indexOf(i);t>=0&&this._raceTimers.splice(t,1),e()},t);this._raceTimers.push(i)}_scheduleRace(e){this._scheduleRaceTimer(()=>this._startRace(),e)}_startRace(){if(!this._config?.wheelchair_race)return;if("undefined"!=typeof window&&window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return void this._scheduleRace(this._nextRaceDelay());if(this._currentBarrierFreeCount()<2)return void this._scheduleRace(this._nextRaceDelay());const{winnerCrossT:e}=this._randomizeRaceParams(),t=Date.now();this._raceState="countdown",this._countdownStartAt=t,this._countdownDigit=3,this._raceEndAt=t+2400+e+150,this._freezeEndAt=this._raceEndAt+1500,this._victoryEndAt=this._freezeEndAt+4e3,this._scheduleCountdownTick()}_scheduleCountdownTick(){if("countdown"!==this._raceState||null===this._countdownStartAt)return;const e=Date.now(),t=e-this._countdownStartAt;if(t>=2400)return void this._beginRacing();const i=Math.max(1,Math.min(3,3-Math.floor(t/tt)));this._countdownDigit!==i&&(this._countdownDigit=i);const r=this._countdownStartAt+(Math.floor(t/tt)+1)*tt,n=Math.max(50,r-e);this._scheduleRaceTimer(()=>this._scheduleCountdownTick(),n)}_beginRacing(){this._raceState="racing",this._countdownDigit=null,this._countdownStartAt=null,this._armStateTransitions()}_measureRaceStartPositions(){const e=this.shadowRoot?.querySelector(".retro");if(!e)return null;const t=e.getBoundingClientRect();if(t.width<=0)return null;const i=this.shadowRoot?.querySelectorAll(".retro-row .retro-wheelchair");if(!i||i.length<2)return null;const r=i[0],n=i[1];if(!r||!n)return null;const s=r.getBoundingClientRect(),o=n.getBoundingClientRect(),a=s.left-t.left,l=o.left-t.left,c=100-("small"===this._config?.size?10:14)/t.width*100-s.width/t.width*100;return{a:a/t.width*100,b:l/t.width*100,finishCqw:c}}_randomizeRaceParams(){const e=this._measureRaceStartPositions(),t=Ye({a:e?.a??0,b:e?.b??0,finishCqw:e?.finishCqw??96});this._raceWinner=t.winner;for(const[e,i]of Object.entries(t.cssVars))this.style.setProperty(e,i);return{winnerCrossT:t.winnerCrossT}}_armStateTransitions(){this._clearRaceTimers();const e=Date.now();"countdown"===this._raceState&&null!==this._countdownStartAt?this._scheduleCountdownTick():"racing"===this._raceState&&null!==this._raceEndAt?this._scheduleRaceTimer(()=>{this._raceState="freeze",this._raceEndAt=null,this._armStateTransitions()},Math.max(0,this._raceEndAt-e)):"freeze"===this._raceState&&null!==this._freezeEndAt?this._scheduleRaceTimer(()=>{this._raceState="victory",this._freezeEndAt=null,this._armStateTransitions()},Math.max(0,this._freezeEndAt-e)):"victory"===this._raceState&&null!==this._victoryEndAt&&this._scheduleRaceTimer(()=>{this._raceState="idle",this._victoryEndAt=null,this._config?.wheelchair_race&&this._scheduleRace(this._nextRaceDelay())},Math.max(0,this._victoryEndAt-e))}_nextRaceDelay(){return 6e4+12e4*Math.random()}_currentBarrierFreeCount(){if(!this._config)return 0;const e=this._resolveEntity();if(!e||!this.hass)return 0;const t=this.hass.states[e]?.attributes??{};return Fe(Array.isArray(t.departures)?t.departures:[],{direction:this._config.direction,lines:this._config.line?[this._config.line]:void 0,walk_times:this._config.walk_times,accessibility_only:this._config.accessibility_only}).slice(0,2).filter(e=>e.barrier_free).length}render(){if(!this._config)return K;const e=this._config,t=this._resolveEntity(),i=t?this.hass?.states?.[t]?.attributes??{}:{},r=Array.isArray(i.departures)?i.departures:[],n=Fe(r,{direction:e.direction,lines:e.line?[e.line]:void 0,walk_times:e.walk_times,accessibility_only:e.accessibility_only}),s=n.slice(0,2),o=s.find(e=>e.platform)?.platform??null,a=e.show_platform?o:null,l="2"===a,c="ptMetro"===(s[0]?.type??""),h=this._t(c?"gleis":"steig"),d=i.stop_name||i.friendly_name||"",u=e.show_station_name&&!!d?this._renderStationName(d,n,r,e.station_bg,i.line_colors??{},e.line):K,p=e.wheelchair_race&&"countdown"===this._raceState,_=e.wheelchair_race&&"racing"===this._raceState,f=e.wheelchair_race&&"freeze"===this._raceState,g=e.wheelchair_race&&"victory"===this._raceState,m=e.wheelchair_race&&"idle"===this._raceState,b="A"===this._raceWinner?1:"B"===this._raceWinner?2:null,w={retro:!0,"retro--gleis-left":!!a&&l,"retro--gleis-right":!!a&&!l,"retro--no-gleis":!a,[`retro--size-${e.size}`]:"regular"!==e.size,[`retro--style-${e.style}`]:"classic"!==e.style,"retro--flicker":e.flicker,"retro--race-countdown":p,"retro--race-active":_,"retro--race-freeze":f,"retro--race-victory":g,"retro--clickable":m};return j`
      <ha-card style="padding:0;overflow:hidden;">
        <div
          class=${me(w)}
          @click=${this._handleCardClick}>
          ${He(this._versionMismatch,e=>this._t(e),"retro-banner")}
          ${u}
          <div class="retro-led">
            ${this._renderMain(t,s,n,r,a,h,i.server_time)}
            ${p&&null!==this._countdownDigit?j`<div class="retro-countdown" role="status" aria-live="polite">
                  ${we(this._countdownDigit,j`<span class="retro-countdown-digit" aria-hidden="true">${this._countdownDigit}</span>`)}
                  <span class="retro-victory-sr">
                    ${this._t("race_starting_in",{n:this._countdownDigit})}
                  </span>
                </div>`:K}
            ${p||_||f?j`<div class="retro-finish-line" aria-hidden="true"></div>`:K}
            ${g?j`<div class="retro-victory" role="status" aria-live="polite">
                  <div class="retro-victory-flag" aria-hidden="true"></div>
                  ${null!==b?j`<div class="retro-victory-winner" aria-hidden="true">
                        <ha-icon class="retro-winner-trophy" icon="mdi:trophy"></ha-icon>
                        <span class="retro-winner-num">${b}</span>
                      </div>`:K}
                  <span class="retro-victory-sr">
                    ${null!==b?this._t("race_winner_announce",{n:b}):this._t("race_finished")}
                  </span>
                </div>`:K}
          </div>
        </div>
      </ha-card>
    `}_renderMain(e,t,i,r,n,s,o){if(!e)return j`<div class="retro-empty" role="status" aria-live="polite">${this._t("no_entity")}</div>`;if(0===t.length){const e=this._config.direction,t=this._config.line,i=r.filter(t=>t.direction===e);let n="no_data";return 0===r.length&&o?n="betriebsschluss":r.length>0&&0===i.length?n="no_data_wrong_direction":t&&i.length>0&&(n="no_data_wrong_line"),j`<div class="retro-empty" role="status" aria-live="polite">${this._t(n)}</div>`}return j`
      <ul class="retro-rows" role="list" aria-label=${this._t("departures_list")}>
        ${t.map(e=>this._renderRow(e))}
      </ul>
      ${n?this._renderGleis(n,s):K}
    `}_renderRow(e){const t=Number.isFinite(e.countdown)?e.countdown:null,i=null!==t&&t<=0,r=e.line||"?",n=e.towards||"",s=[r,n,null===t?this._t("no_data"):i?this._t("at_platform"):this._t("countdown_minutes",{n:String(t)}),e.barrier_free?this._t("barrier_free_title"):""].filter(Boolean).join(" — ");return j`
      <li class="retro-row" aria-label=${s}>
        <div class="retro-line" aria-hidden="true">${r}</div>
        <div class="retro-dest" aria-hidden="true">
          <span class="retro-dest-text">${$e(n)}</span>
          ${e.barrier_free?j`<ha-icon
                class="retro-wheelchair"
                icon="mdi:wheelchair-accessibility"
                title=${this._t("barrier_free_title")}
              ></ha-icon>`:K}
        </div>
        <div class="retro-cd" aria-hidden="true">
          ${null===t?"--":i?j`<span class="retro-stars"><span>*</span><span>*</span></span>`:String(t)}
        </div>
      </li>
    `}_renderGleis(e,t){return j`
      <div class="retro-gleis">
        <div class="retro-gleis-label">${t}</div>
        <div class="retro-gleis-number">${e}</div>
      </div>
    `}_renderStationName(e,t,i,r,n,s){let o,a;if("white"===r)o="#fff",a="#000";else if("black"===r)o="#000",a="#fff";else{const e=t.length?t:i,r=s||e[0]?.line;if(r){const e=function(e,t,i={},r="var(--primary-color)"){const n=e.toUpperCase();if(void 0!==t[n])return{background:t[n]};if(/^N\d/.test(n))return{background:"#1b1464",color:"#fef200"};const s=i[e]??i[n];return s?.bg?s.fg?{background:`#${s.bg}`,color:`#${s.fg}`}:{background:`#${s.bg}`}:{background:r}}(r,{},n);o=e.background,a=e.color??"#fff","var(--primary-color)"===o&&(o="#fff",a="#000")}else o="#fff",a="#000"}return j`
      <div class="retro-station" style=${xe({background:o,color:a})}>
        <div class="retro-station-name">${$e(e)}</div>
      </div>
    `}static{this.styles=o`
    :host {
      display: block;
      /* Create a stacking context on the host so the high z-indexes
         inside (screen-door overlay z=30, victory overlay z=20,
         winner badge z=22, etc.) only compete with other elements
         inside this card. Without this, race overlays and the LED
         dot pattern can render above HA's dashboard chrome. */
      isolation: isolate;
    }
    .retro {
      /* Classic defaults — swapped wholesale by .retro--style-warm below. */
      --led-amber: #FFC700;
      --led-bg: #000;
      --led-substrate: #1a0d2a;
      --led-glow-rgb: 255 199 0;
      --led-dot-size: 0.5px;
      --led-dot-edge: 1px;
      --led-dot-pitch: 4px;

      /* LED area inner padding. Lives on the LED element; declared here so
         size/gleis variants can override via the .retro cascade. */
      --retro-pad-y: 14px;
      --retro-pad-r: 22px;
      --retro-pad-l: 22px;

      /* Establish a container so the race exit animation can translate
         wheelchairs by 100cqw (= full card width) regardless of size. */
      container-type: inline-size;
      position: relative;
      display: flex;
      flex-direction: column;
      font-family: 'Courier New', Courier, 'Lucida Console', Monaco, monospace;
      font-weight: 700;
      letter-spacing: 0.08em;
      overflow: hidden;
      min-height: 110px;
    }
    .retro-led {
      /* The actual LED display area — own positioning context so the
         race finish-line and victory overlay fill it edge-to-edge with a
         simple inset:0, no negative-margin gymnastics. */
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
    /* Pixel style — vintage LED-dot-matrix departure-board look. A
       layer above all panel content is transparent at the substrate-
       dot positions and opaque LED-bg between them, so amber text +
       glow + race choreography (wheelchairs, finish strip, countdown
       digit, victory flag, trophy badge) all show through *only* at
       dot positions — aligned with the substrate dot pattern beneath.
       Everything in the LED area becomes discrete "lit LED dots" for a
       consistently dotty panel material.
       Pixel inherits the warm color palette (3px dot pitch) because
       the classic style's 4px pitch is too coarse for the screen-door
       and small text becomes illegible. z-index 30 sits above the
       wheelchair (4), finish strip (3), countdown (18), victory (20)
       — and the trophy badge inside victory's isolated stacking
       context (which appears at z=20 from .retro-led's perspective). */
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
      /* Was a <div>; now a <ul> for semantic departure list. Reset the
         default user-agent list chrome so layout is unchanged. */
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
    }
    .retro-line {
      font-weight: 400;
      text-align: left;
      transition: opacity 0.15s ease-out;
    }
    .retro-dest {
      display: flex;
      align-items: baseline;
      gap: 0.35em;
      overflow: hidden;
      text-transform: uppercase;
      min-width: 0;
      transition: opacity 0.15s ease-out;
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
      filter: drop-shadow(0 0 6px rgb(var(--led-glow-rgb) / 0.7));
      transform: translateY(0.18em);
    }
    .retro-cd {
      font-variant-numeric: tabular-nums;
      text-align: right;
      min-width: 2.5em;
      transition: opacity 0.4s ease-out;
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
    /* Irregular, mostly-on flicker — brief dips and rare blackouts on the
       line badge. Keeps full opacity ~95% of the loop so it reads as a
       struggling bulb rather than a blinking sign. */
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
      /* Offset the second row so the two badges don't flicker in lockstep. */
      .retro--flicker .retro-row:nth-child(2) .retro-line {
        animation-duration: 8.1s;
        animation-delay: -2.4s;
      }
    }
    /* Wheelchair race — per-race pattern encodes who's ahead at 25/50/
       75%, so each run has at least one overtake. Per-racer waypoints
       (--race-x-25/50/75), end offset, and duration come from CSS
       custom properties that JS sets at race start. Keyframe preserves
       the 0.18em baseline offset so the icon doesn't jump vertically.
       Per-keyframe timing-functions: ease-out for the launch (burst
       out of the gate) and a symmetric cubic-bezier for every middle
       segment. The cubic-bezier (0.4, 0.2, 0.6, 0.8) has endpoint
       slopes of ~0.5× the segment's average velocity, peaking ~1.5×
       in the middle — so when the swap pattern flips lead/trail at a
       checkpoint, the velocity transition reads as a smooth ease
       instead of an abrupt lurch. */
    @keyframes retroWheelExit {
      0%   { transform: translate(0, 0.18em); animation-timing-function: ease-out; }
      25%  { transform: translate(var(--race-x-25, 25cqw), 0.18em); animation-timing-function: cubic-bezier(0.4, 0.2, 0.6, 0.8); }
      50%  { transform: translate(var(--race-x-50, 50cqw), 0.18em); animation-timing-function: cubic-bezier(0.4, 0.2, 0.6, 0.8); }
      75%  { transform: translate(var(--race-x-75, 75cqw), 0.18em); animation-timing-function: cubic-bezier(0.4, 0.2, 0.6, 0.8); }
      100% { transform: translate(var(--race-end, 110cqw), 0.18em); }
    }
    @media (prefers-reduced-motion: no-preference) {
      /* LED prep: countdown, racing, and the photo-finish freeze all
         share the same row-clearing + overflow-visible setup. */
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
      /* Only fade Gleis/Steig during the prep when it's on the right —
         that's the wheelchairs' path. Left-side Gleis stays lit. */
      .retro--race-countdown.retro--gleis-right .retro-gleis,
      .retro--race-active.retro--gleis-right .retro-gleis,
      .retro--race-freeze.retro--gleis-right .retro-gleis {
        opacity: 0;
      }
      /* Animation declarations apply during both active and freeze so
         the in-flight animation keeps its identity across the state
         flip — animation-play-state: paused below freezes the frame
         instead of restarting from 0%. */
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
      /* Photo-finish freeze: pauses both wheelchair animations at
         the moment shortly after the winner crosses the finish line.
         The viewer gets a clear still frame — winner at the strip,
         loser caught a step behind — before the trophy appears. */
      .retro--race-freeze .retro-wheelchair {
        animation-play-state: paused;
      }
      /* Pass wheelchairs in front of the finish-line strip so the
         crossing reads as "through" rather than "behind the barrier". */
      .retro--race-active .retro-wheelchair,
      .retro--race-freeze .retro-wheelchair {
        position: relative;
        z-index: 4;
      }
      /* Victory holds the racers off-screen until the idle reset. */
      .retro--race-victory .retro-wheelchair {
        opacity: 0;
      }
    }
    /* Hide all row text during victory so nothing bleeds through the
       (slightly transparent) checker flag. */
    .retro--race-victory .retro-line,
    .retro--race-victory .retro-dest,
    .retro--race-victory .retro-cd,
    .retro--race-victory .retro-gleis {
      opacity: 0;
    }
    /* Flicker keyframes set their own opacity values, which win over
       the static opacity:0 above while the animation is running.
       Disable the flicker entirely during victory so the line badge
       hides cleanly with the rest of the row text. */
    .retro--race-victory.retro--flicker .retro-line {
      animation: none;
    }
    /* Pixelated finish-line strip on the right edge during the race.
       Same conic-gradient checker technique as the victory flag, but
       as a narrow 14px column so ~2 squares wide read as chunky "8-bit
       goal posts". Clipped by the card's border-radius via overflow. */
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
    /* Smaller strip on the small variant so it doesn't dominate. */
    .retro--size-small .retro-finish-line {
      width: 10px;
      background-size: 10px 10px;
    }
    /* Victory overlay: 90s-racing-sim checkered flag scrolling horizontally
       with a pulsing trophy centered on top. */
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
      /* Size container so the flag can query card height via cqh and
         keep its checker squares actually square regardless of size. */
      container-type: size;
      animation: retroVictoryAppear 0.22s ease-out both;
    }
    /* Screen-reader-only label inside the victory overlay. The overlay
       is purely visual (checkered flag animation) so we ship a hidden
       text announcement in a role="status"/aria-live region — screen
       readers speak it when the race finishes, sighted users see the
       animation. */
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
      /* Transparent "dark" tiles let the LED substrate dot pattern of the
         card show through; only the amber rectangles are painted, then the
         drop-shadow filter gives each one the same glow as the row text. */
      background-image: conic-gradient(
        transparent 0deg 90deg,
        var(--led-amber) 90deg 180deg,
        transparent 180deg 270deg,
        var(--led-amber) 270deg 360deg
      );
      /* Tile = 50cqh × 50cqh — square, so height divides the card into
         2 tile rows (= 4 rectangle rows) and the individual rectangles
         stay square at every card size. */
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

    /* Pre-race countdown overlay — "3, 2, 1" punch-in over the LED
       panel before the racers leave the gate. Single big chunky
       monospace numeral in LED-amber, glowing, with a punch-scale
       animation per digit (Lit re-mounts the <span> via keyed() so
       the keyframe re-fires each tick). The overlay dims the LED
       behind it slightly so the digit reads cleanly. */
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

    /* Winner badge — circular cut-out centered on the victory checker
       flag. Background = the card's LED substrate (--led-bg, black in
       classic, dark warm-amber in warm mode) so the badge reads as
       "punched through" the checker flag rather than sitting on top of
       it. Amber LED ring + glow gives it the same lit-from-within
       feel as the rest of the LED panel. mdi:trophy is the visual
       anchor; the lane number sits on its plinth. */
    .retro-victory-winner {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 22;
      /* +10% over the previous 41cqmin / 82px / 172px sizing so the
         trophy + lane number have more breathing room inside the LED
         ring without crowding the embossed numerals. */
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
    /* Lane number on the trophy cup. Coloured with --led-substrate (the
       same dot colour the rest of the panel uses for unlit pixels) so
       the digit reads as a hole punched out of the trophy's lit amber
       — matching the dotted-board / Punktmatrix aesthetic across all
       three style variants. No text-shadow / embossing: with the
       substrate-tone digit, any lit-edge highlight reads as a halo
       around a "missing pixel" hole, which is the wrong material. */
    .retro-winner-num {
      position: absolute;
      top: 44%;
      left: 0;
      right: 0;
      transform: translateY(-50%);
      text-align: center;
      font-family: "Arial Black", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-weight: 900;
      /* -10% from the previous 22cqmin so the digit sits inside the
         cup bowl rather than overflowing onto the trophy stem. */
      font-size: 20cqmin;
      line-height: 1;
      color: var(--led-substrate);
      letter-spacing: -0.04em;
      pointer-events: none;
    }
    /* Tighter on the small variant so trophy + number still fit. */
    .retro--size-small .retro-winner-trophy {
      --mdc-icon-size: 51cqmin;
    }
    .retro--size-small .retro-winner-num {
      /* -10% from the previous 19cqmin, same rationale as base. */
      font-size: 17cqmin;
      /* On small the badge hits its 82px min-width while the trophy
         icon scales down independently — so the cup ends up a touch
         higher in the badge than on regular/medium. Nudge the number
         up the same amount so it lands on the cup body, not below it. */
      top: 37%;
    }
    /* Pixel mode alignment fix: drop the trophy badge's own substrate
       gradient. The badge's gradient origin doesn't coregister with
       the panel-wide screen-door overlay, so its dots fight the
       overlay's dots inside the badge area. Without it, the trophy
       circle is a clean solid LED-bg cutout from the dotted panel —
       a dark frame around the dotted trophy icon and number. */
    .retro--style-pixel .retro-victory-winner {
      background-image: none;
    }
    /* Pixel style: add 1px of breathing room between the countdown
       digits and the gleis indicator. The screen-door overlay can
       make the dotted digits feel jammed against the gleis dots, so
       a single extra pixel of separation reads cleanly. Covers
       gleis-right (default), gleis-left (platform 2), and the small
       size variant where the base margin starts smaller. */
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
      border-left: 1px solid rgb(var(--led-glow-rgb) / 0.25);
      transition: opacity 0.4s ease-out;
    }
    .retro--gleis-left .retro-gleis {
      padding: 0 18px 0 14px;
      margin-left: 0;
      margin-right: 12px;
      border-left: none;
      border-right: 1px solid rgb(var(--led-glow-rgb) / 0.25);
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

    /* Accessibility: visible focus ring for keyboard users. */
    a:focus-visible,
    button:focus-visible {
      outline: 2px solid var(--led-amber, #ffa000);
      outline-offset: 2px;
      border-radius: 4px;
    }

    /* Accessibility: honour user motion preference.
       Catch-all: nukes any animation/transition the feature-gated
       @media (prefers-reduced-motion: no-preference) blocks above
       don't already exclude. */
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
  `}};e([ue({attribute:!1})],it.prototype,"hass",void 0),e([pe()],it.prototype,"_config",void 0),e([pe()],it.prototype,"_versionMismatch",void 0),e([pe()],it.prototype,"_raceState",void 0),e([pe()],it.prototype,"_countdownDigit",void 0),e([pe()],it.prototype,"_raceWinner",void 0),it=e([ce("wiener-linien-austria-retro-card")],it);export{it as WienerLinienAustriaRetroCard};

/* @flow */

import React, { Component } from 'react';
import type { Node } from 'react'
import ReactDOM from 'react-dom';
import marked from 'marked';
import prism from 'prismjs';

import Canvas from './canvas';
import './prism.css';
import './style.css';

export default class Markdown extends Component<{}> {

  components: any;
  renderer: any;
  document: Function;
  getTheme: Function;

  constructor(props: any) {
    super(props);

    this.components = new Map();

    this.renderer = new marked.Renderer();
    this.renderer.table = (header: any, body: any) => {
      return `<table class="grid"><thead>${header}</thead><tbody>${body}</tbody></table>`;
    };
  }

  componentDidMount(): void {
    this.renderDOM();
  }

  componentDidUpdate(): void {
    this.renderDOM();
  }

  renderDOM(): void {
    for (const [id, component] of this.components) {
      const div = document.getElementById(id);    
      if (div instanceof HTMLElement) {     
        ReactDOM.render(component, div);
      }
    }
    prism.highlightAll();
  }

  render(): Node {
    const document = this.document && this.document(localStorage.getItem('ACE_LANGUAGE') || 'zh-CN');
    if (typeof document === 'string') {
      this.components.clear();
      const theme = this.getTheme && this.getTheme();
      const props = Object.keys(this.props)
        .filter((key: string) => ['classes', 'theme'].indexOf(key) < 0)
        .reduce((newObj: {}, key: string) => Object.assign(newObj, { [key]: this.props[key] }), {})
      const html = marked(document.replace(/:::\s?demo\s?([^]+?):::/g, (match: any, p1: any, offset: number) => {
        const id = offset.toString(36);       
        this.components.set(id, React.createElement(Canvas, Object.assign({
          name: this.constructor.name.toLowerCase(),
          theme
        }, props), p1));
        return `<div id=${id}></div>`;
      }), { renderer: this.renderer });


      return (
        <div className={`markdown-only ${theme}`} dangerouslySetInnerHTML={{
          __html: html
        }} />
      )
    } else {
      return <span />
    }
  }
}
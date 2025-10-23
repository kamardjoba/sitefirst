import React from 'react'
export default class ErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={hasError:false}}
  static getDerivedStateFromError(){return {hasError:true}}
  componentDidCatch(){}
  render(){ if(this.state.hasError){return <div className="p-8">Произошла ошибка. Обновите страницу.</div>} return this.props.children }
}

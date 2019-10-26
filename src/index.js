import {compose,mkProxy,pointer,zipList} from './util.js'

export default function truth(...ops)
{
	let
	i=ops.findIndex(x=>!(x instanceof Function)),
	[preOps,initialValue,postOps]=zipList(ops,i),
	setState=act=>
	{
		act=compose([...pre,act=>truth.inject(initialValue,act)],act)

		//promise return prevents holding up subsequent code
		return act?new Promise(res=>res(compose(post,act))):act
	},
	proxyState=mkProxy(setState,initialValue),
	rtn=[proxyState,setState],
	[pre,post]=[preOps,postOps].map(arr=>arr.map(fn=>fn.compile?fn(...rtn):fn))

	setState({type:'set',path:[],value:initialValue})

	return rtn
}
//todo: change to action handler (make compile functionality the default)
truth.compile=fn=>Object.assign(fn,{compile:true})
truth.inject=function(state,act)
{
	if(!act.type) return

	const
	{path,type,value}=act,
	[props,prop]=zipList(path,path.length-1),
	ref=pointer(state,props)

	type==='del'?delete ref[prop]:
	type==='set'&&path.length?ref[prop]=value:
	state=value//@todo this will cause a bug if setting initial state.... that has already been set

	return act
}

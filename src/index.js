import {compose,mkProxy,pointer,ziplist} from './util.js'

export default function truth(...ops)
{
	// todo: on initial run, check if ops return functions, 
	// and if they do, use them instead?
	let
	i=ops.findIndex(x=>!(x instanceof Function)),
	[preOps,state,postOps]=ziplist(ops,i),
	update=function(act)//promise return prevents holding up subsequent code
	{
		act=compose([...pre,act=>truth.inject(state,act)],act)
		return act?new Promise(res=>res(compose(post,act))):act
	},
	proxy=mkProxy(update,state),
	pre=preOps.map(fn=>fn.compile?fn(proxy/*{state:proxy,update}*/):fn),
	post=postOps.map(fn=>fn.compile?fn(proxy/*{state:proxy,update}*/):fn)

	update({type:'set',path:[],value:state})
	return {pre,state:proxy,post,update}
}
truth.compile=fn=>Object.assign(fn,{compile:true})
truth.inject=function(state,act)
{
	if(!act.type) return

	const
	{path,type,value}=act,
	[props,prop]=ziplist(path,path.length-1),
	ref=pointer(state,props)

	type==='del'?delete ref[prop]:
	type==='set'&&path.length?ref[prop]=value:
	state=value//@todo this will cause a bug if setting inital state.... that has already been set

	return act
}
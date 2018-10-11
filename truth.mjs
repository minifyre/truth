export default function truth(...ops)
{
	let
	i=ops.findIndex(x=>!(x instanceof Function)),
	[pre,state,post]=truth.zipList(ops,i),
	send=function(act)//promise return prevents holding up subsequent code
	{
		act=truth.compose(pre,act)
		return act?new Promise(res=>res(truth.compose(post,act))):act
	}
	pre.push(act=>truth.inject(state,act))
	send({type:'set',path:[],val:state})
	return truth.proxy(send,state)
}
truth.compose=(fns,arg)=>fns.reduce((arg,fn)=>fn(arg),arg)
truth.inject=function(state,act)
{
	if(!act.type) return
	const
	{path,type,val}=act,
	[props,prop]=truth.zipList(path,path.length-1),
	ref=truth.ref(state,props)
	type==='del'?delete ref[prop]:
	type==='set'&&path.length?ref[prop]=val:
	state=val
	return act
}
truth.proxy=function(send,obj,path=[])
{
	return typeof obj==='object'&&obj!==null?
	new Proxy(obj,
	{
		deleteProperty:(obj,prop)=>send({type:'del',path:[...path,prop]}),
		get:(obj,prop)=>truth.proxy(send,obj[prop],[...path,prop]),
		set:(obj,prop,val)=>send({type:'set',path:[...path,prop],val})
	}):obj
}
truth.ref=(ref,path)=>path.reduce((ref,prop)=>ref[prop],ref)
truth.zipList=(x,i)=>[x.slice(0,i),x[i],x.slice(i+1)]
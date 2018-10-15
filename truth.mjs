export default function truth(...ops)
{
	let
	i=ops.findIndex(x=>!(x instanceof Function)),
	[pre,state,post]=truth.zipList(ops,i),
	send=function(act)//promise return prevents holding up subsequent code
	{
		act=truth.compose([...pre,act=>truth.inject(state,act)],act)
		return act?new Promise(res=>res(truth.compose(post,act))):act
	}
	send({type:'set',path:[],value:state})
	return {pre,state:truth.proxy(send,state),post,update:send}
}
truth.compose=(fns,arg)=>fns.reduce((arg,fn)=>fn(arg),arg)
truth.inject=function(state,act)
{
	if(!act.type) return
	const
	{path,type,value}=act,
	[props,prop]=truth.zipList(path,path.length-1),
	ref=truth.ref(state,props)
	type==='del'?delete ref[prop]:
	type==='set'&&path.length?ref[prop]=value:
	state=value//@todo this will cause a bug if setting inital state.... that has already been set
	return act
}
truth.proxy=function(send,obj,path=[])
{
	return typeof obj==='object'&&obj!==null?
	new Proxy(obj,
	{
		deleteProperty:(obj,prop)=>send({type:'del',path:[...path,prop]}),
		get:(obj,prop)=>truth.proxy(send,obj[prop],[...path,prop]),
		set:(obj,prop,value)=>send({type:'set',path:[...path,prop],value})
	}):obj
}
truth.ref=(ref,path)=>path.reduce((ref,prop)=>ref[prop],ref)
truth.zipList=(x,i)=>[x.slice(0,i),x[i],x.slice(i+1)]
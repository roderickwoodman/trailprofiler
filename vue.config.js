module.exports = {
	PublicPath: process.env.NODE_ENV === 'production'
		? '/trailprofiler/'
		: '/'
};
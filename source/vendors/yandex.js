// @project XTranslate (vendors/yandex.js)
// @url https://github.com/extensible/XTranslate

// http://translate.yandex.ru/dicservice.json/lookup?callback=&ui=ru&lang=en-ru&text=test

XTranslate.vendors.add(
{
	name: 'Yandex',
	url: 'http://translate.yandex.net',

	handler: function( selection )
	{
		var 
			lang = settings('lang'),
			text = encodeURIComponent( selection ),
			type = selection.split(' ').length > 1 ? 'common' : 'dictionary',
			translation = {
				common: {
					url: this.url + [
						'/tr/translate?lang=', lang.from +'-'+ lang.to,
						'&text='+ text
					].join(''),
					
					data: function( response ){ return this.responseXML.documentElement.textContent.replace(/</g, '&lt;') },
					content: function( data ){ return data }
				},

				dictionary: {
					url: this.url + [
						'/dicservice.json/lookup',
						'?callback=',
						'&ui='+ lang.to,
						'&lang='+ lang.from +'-'+ lang.to,
						'&text='+ text
					].join(''),
					
					data: function( response ){
						return Function('return '+ response.replace(/</g, '&lt;'))()
					},
					
					content: function( data )
					{
						return data.def.map(function( wordtype )
						{
							return [
								'<dl class="XTranslate_wordtype">',
									'<dt>'+ wordtype.pos +'</dt>',
									'<dd>',
										wordtype.tr.map(function( translate )
										{
											return translate.text + (
												translate.syn && translate.syn.length 
													? ', '+ translate.syn.map(function(s){ return s.text }).join(', ')
													: ''
											);
										}).join(', '),
									'</dd>',
								'</dl>'
							].join('')
						}).join('')
					}
				}
			},
			
			action = translation[type];
		
		return deferred(function(dfr)
		{
			ajax({
				url: action.url,
				complete: function( response )
				{
					var data = action.data.call(this, response);
					var html = [
						'<div class="XTranslate_result Powered_by_Yandex">',
							action.content.call(this, data),
						'</div>'
					].join('');
					
					dfr.resolve({
						html: html,
						response: response
					});
				}
			});
		});
	},
	
	loadData: function()
	{
		ajax({
			context: this,
			url: 'vendors/yandex.lang',
			complete: function( text )
			{
				this.langs = text.trim().split(/\r?\n+/).map(function( line ){
					var lang = line.split(/\s*-\s*/);
					return {
						name: lang[0].trim(),
						iso: lang[1].trim()
					}
				});
			}
		});
	}
});

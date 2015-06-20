var expect = require('expect.js');
var fs = require('fs');
var proxyquire = require('proxyquire');
var Promise = require('bluebird');
var buildRequest = proxyquire('../../../lib/ComposedObjectFactories/ratesAccuracy', {
	'../../config': {
		lookupStore: function() {
			return new Promise(function(resolve) {
				resolve({
					getJsonForKey: function(key) {
						return new Promise(function(resolve) {
							resolve(fakeRedisData[key]);
						});
					}
				});
			});
		}
	}
});

var fakeRedisData = {};

describe('ratesAccuracyCheck', function() {
	it('sets type to "cross_application_request".', function(done) {
		buildRequest({
			events: [
				{
					"@timestamp": "2015-06-17T13:53:35.814Z",
					"type": "lr_varnish_request",
					"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
					"@type": "lr_varnish_request",
					"url_querystring_hotelId": "195042",
					"url_querystring_rate": "503.89",
					"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
					"url_querystring_date": "1435878000",
					"url_querystring_nights": "3",
					"url_querystring_adults": "2",
					"url_querystring_children": "0"
				}
			]
		}).then(function(result) {
			expect(result.type).to.be('rates_accuracy_result');
			done();
		});
	});

	it('sets hotelDetailsPresent to false when no hotel details request.', function(done) {
		buildRequest({
			events: [
				{
					"@timestamp": "2015-06-17T13:53:35.814Z",
					"type": "lr_varnish_request",
					"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
					"req_headers": {
						"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
					},
					"@type": "lr_varnish_request",
					"url_querystring_hotelId": "195042",
					"url_querystring_rate": "503.89",
					"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
					"url_querystring_date": "1435878000",
					"url_querystring_nights": "3",
					"url_querystring_adults": "2",
					"url_querystring_children": "0"
				}
			]
		}).then(function(result) {
			expect(result.hotelDetailsPresent).to.be(false);
			done();
		});
	});

	describe('single search and hotel details request', function() {
		it('sets hotelId', function(done) {
			buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).then(function(result) {
				expect(result.hotelId).to.be(195042);
				done();
			});
		});

		it('sets hotel details provider', function(done) {
			fakeRedisData['hotel_195042'] = { providerName: 'HotelProvider' };

			buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).then(function(result) {
				expect(result.hotelDetails.providerName).to.be('HotelProvider');
				done();
			});
		});

		it('sets Commission provider to LateRooms', function(done) {
			fakeRedisData['hotel_195042'] = { providerName: 'Commission' };

			buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).then(function(result) {
				expect(result.hotelDetails.providerName).to.be('LateRooms');
				done();
			});
		});

		it('sets searchId', function(done) {
			buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).then(function(result) {
				expect(result.searchId).to.be("1ec79c06-dd05-4f3d-8b9a-a7a49b142e05");
				done();
			});
		});

		it.skip('sets date', function(done) {
			var moment = require('moment');

			buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).then(function(result) {
				expect(result.date).to.be("2015-07-03");
				done();
			});
		});

		it('sets nights', function(done) {
			buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).then(function(result) {
				expect(result.nights).to.be(3);
				done();
			});
		});

		it('sets adults', function(done) {
			buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).then(function(result) {
				expect(result.adults).to.be(2);
				done();
			});

		});

		it('sets children', function(done) {
			buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).then(function(result) {
				expect(result.children).to.be(0);
				done();
			});

		});

		it('sets searchRate', function(done) {
			buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"req_headers": {
							"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
						},
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).then(function(result) {
				expect(result.searchRate).to.be(503.89);
				done();
			});

		});

		it('sets hotelDetailsRate', function(done) {
			buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"req_headers": {
							"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
						},
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					},
					{
						"@timestamp": "2015-06-17T13:53:39.999Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"req_headers": {
							"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
						},
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "501.01",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).then(function(result) {
				expect(result.hotelDetailsRate).to.be(501.01);
				done();
			});

		});

		it('sets corrects order', function(done) {
			buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:39.999Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"req_headers": {
							"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
						},
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "501.01",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					},
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"req_headers": {
							"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
						},
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).then(function(result) {
				expect(result.hotelDetailsPresent).to.be(true);
				done();
			});
		});

		it('corrects for client order mistmatch', function(done) {
			buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:39.999Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"req_headers": {
							"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
						},
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "501.01",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					},
					{
						"@timestamp": "2015-06-17T13:53:40.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"req_headers": {
							"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
						},
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).then(function(result) {
				expect(result.hotelDetailsPresent).to.be(true);
				done();
			});

		});

		it('sets hotelDetailsPresent to false when no hotel details request.', function(done) {
			buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"req_headers": {
							"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
						},
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					},
					{
						"@timestamp": "2015-06-17T13:53:39.999Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"req_headers": {
							"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
						},
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "501.01",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).then(function(result) {
				expect(result.hotelDetailsPresent).to.be(true);
				done();
			});

		});

		it('sets availabilityStatus', function(done) {
			buildRequest({
				events: [
					{
						"@timestamp": "2015-06-17T13:53:35.814Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"req_headers": {
							"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
						},
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "503.89",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					},
					{
						"@timestamp": "2015-06-17T13:53:39.999Z",
						"type": "lr_varnish_request",
						"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
						"req_headers": {
							"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
						},
						"@type": "lr_varnish_request",
						"url_querystring_hotelId": "195042",
						"url_querystring_rate": "501.01",
						"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
						"url_querystring_date": "1435878000",
						"url_querystring_nights": "3",
						"url_querystring_adults": "2",
						"url_querystring_children": "0"
					}
				]
			}).then(function(result) {
				expect(result.availabilityStatus).to.be('OK');
				done();
			});
		});

		describe('when search availability but no hotel details availability', function() {
			it('sets setsAvailabilityStatus', function(done) {
				buildRequest({
					events: [
						{
							"@timestamp": "2015-06-17T13:53:35.814Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_rate": "503.89",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						},
						{
							"@timestamp": "2015-06-17T13:53:39.999Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						}
					]
				}).then(function(result) {
					expect(result.availabilityStatus).to.be('ERROR');
					done();
				});
			});

			it('sets setsAvailabilityMissing', function(done) {
				buildRequest({
					events: [
						{
							"@timestamp": "2015-06-17T13:53:35.814Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_rate": "503.89",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						},
						{
							"@timestamp": "2015-06-17T13:53:39.999Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						}
					]
				}).then(function(result) {
					expect(result.availabilityMissing).to.be('HotelDetails');
					done();
				});
			});
		});

		describe('when no search availability but hotel details availability', function() {
			it('sets setsAvailabilityStatus', function(done) {
				buildRequest({
					events: [
						{
							"@timestamp": "2015-06-17T13:53:35.814Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						},
						{
							"@timestamp": "2015-06-17T13:53:39.999Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_rate": "503.89",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						}
					]
				}).then(function(result) {
					expect(result.availabilityStatus).to.be('ERROR');
					done();
				});

			});

			it('sets setsAvailabilityMissing', function(done) {
				buildRequest({
					events: [
						{
							"@timestamp": "2015-06-17T13:53:35.814Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						},
						{
							"@timestamp": "2015-06-17T13:53:39.999Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_rate": "503.89",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						}
					]
				}).then(function(result) {
					expect(result.availabilityMissing).to.be('Search');
					done();
				});
			});
		});

		describe('when no search availability and no hotel details availability', function() {
			it('sets setsAvailabilityStatus', function(done) {
				buildRequest({
					events: [
						{
							"@timestamp": "2015-06-17T13:53:35.814Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						},
						{
							"@timestamp": "2015-06-17T13:53:39.999Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						}
					]
				}).then(function(result) {
					expect(result.availabilityStatus).to.be('OK');
					done();
				});

			});

			it('sets setsAvailabilityMissing', function(done) {
				buildRequest({
					events: [
						{
							"@timestamp": "2015-06-17T13:53:35.814Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=503.89&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/k14605275_amsterdam-hotels.aspx?k=Amsterdam&d=20150703&n=3&rt=2-0&rt-adult=2&rt-child=0"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						},
						{
							"@timestamp": "2015-06-17T13:53:39.999Z",
							"type": "lr_varnish_request",
							"url": "/beacon/hotelDetailsAccuracy?hotelId=195042&rate=501.01&searchId=1ec79c06-dd05-4f3d-8b9a-a7a49b142e05&date=1435878000&nights=3&adults=2&children=0",
							"req_headers": {
								"Referer": "http://www.laterooms.com/en/hotel-reservations/195042_hotel-cc-amsterdam.aspx"
							},
							"@type": "lr_varnish_request",
							"url_querystring_hotelId": "195042",
							"url_querystring_searchId": "1ec79c06-dd05-4f3d-8b9a-a7a49b142e05",
							"url_querystring_date": "1435878000",
							"url_querystring_nights": "3",
							"url_querystring_adults": "2",
							"url_querystring_children": "0"
						}
					]
				}).then(function(result) {
					expect(result.availabilityMissing).to.be('SearchAndHotelDetails');
					done();
				});
			});
		});
	});

	describe('multiple search requests then hotel details requests are handled', function() {
		it('rate comparison is of hotel details request immediately after a search', function(done) {
			var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
			var parsedData = JSON.parse(fileData);

			buildRequest({
				events: parsedData
			}).then(function(result) {
				expect(result[0].hotelDetailsRate).to.eql(501.01);
				done();
			});
		});

		describe('multiple accuracy reports are fired for multiple hotel details accuracy reports for the same hotel', function() {
			describe('second accuracy report', function() {
				it('sets hotel details rate', function(done) {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					buildRequest({
						events: parsedData
					}).then(function(result) {
						expect(result[1].hotelDetailsRate).to.eql(353.66);
						done();
					});
				});

				it('sets accuracy report number', function(done) {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					buildRequest({
						events: parsedData
					}).then(function(result) {
						expect(result[1].number).to.eql(2);
						done();
					});
				});

				it('sets hotelId', function(done) {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					buildRequest({
						events: parsedData
					}).then(function(result) {
						expect(result[1].hotelId).to.eql(195042);
						done();
					});
				});

				it('sets @timestamp', function(done) {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					buildRequest({
						events: parsedData
					}).then(function(result) {
						expect(result[1]['@timestamp']).to.eql('2015-06-17T13:53:50.694Z');
						done();
					});
				});
			});
		});

		describe('multiple accuracy reports are fired for multiple hotel details accuracy reports for the same hotel', function() {
			describe('third accuracy report', function() {
				it('sets hotelId', function(done) {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					buildRequest({
						events: parsedData
					}).then(function(result) {
						expect(result[2].hotelId).to.eql(145945);
						done();
					});
				});

				it('sets accuracy report number', function(done) {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					buildRequest({
						events: parsedData
					}).then(function(result) {
						expect(result[2].number).to.eql(1);
						done();
					});
				});

				it('sets search rate', function(done) {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					buildRequest({
						events: parsedData
					}).then(function(result) {
						expect(result[2].searchRate).to.eql(559.75);
						done();
					});
				});

				it('sets hotel details rate', function(done) {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					buildRequest({
						events: parsedData
					}).then(function(result) {
						expect(result[2].hotelDetailsRate).to.eql(556.54);
						done();
					});
				});

				it('sets rate difference', function(done) {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					buildRequest({
						events: parsedData
					}).then(function(result) {
						expect(result[2].difference).to.be(3.21);
						done();
					});
				});

				it('sets rate difference percentage', function(done) {
					var fileData = fs.readFileSync(__dirname + '/data/complexOrder.json');
					var parsedData = JSON.parse(fileData);

					buildRequest({
						events: parsedData
					}).then(function(result) {
						expect(result[2].percentageDifference).to.be(100.58);
						done();
					});
				});
			});
			
		});
	});
});

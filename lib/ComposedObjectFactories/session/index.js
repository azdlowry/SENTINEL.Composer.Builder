var _ = require('lodash');
var moment = require('moment');

var buildUser = require('./user');
var buildBooking = require('./booking');
var buildBookingInfo = require('./bookingInfo');
var buildBookingJourney = require('./bookingJourney');
var buildNewBookingJourney = require('./newBookingProcessJourney');
var buildRequests = require('./requests');
var buildErrors = require('./errors');
var buildPartnerJourney = require('./partnerJourney');
var buildTokeniserJourney = require('./tokeniser');
var buildRatesAccuracySummary = require('./ratesAccuracySummary');
var buildSearchJourney = require('./searchJourney');

module.exports = function (sessionLog) {
	var booking = buildBooking(sessionLog);
	var user = buildUser(sessionLog);
	var firstEvent = _.first(sessionLog.events);
	var lastEvent = _.last(sessionLog.events);

	var bookingJourney = buildBookingJourney(sessionLog);
	var newBookingJourney = buildNewBookingJourney(sessionLog)

	return {
		sessionId: sessionLog.key,
		type: 'session',
		started: firstEvent['@timestamp'],
		'@timestamp': lastEvent['@timestamp'],
		length: moment(lastEvent['@timestamp']).diff(moment(firstEvent['@timestamp']), 'ms'),
		errors: buildErrors(sessionLog),
		booked: booking ? true : false,
		user: user,
		bookingDetails: booking,
		tokeniserJourney: buildTokeniserJourney(sessionLog),
		allBookingDetails: buildBookingInfo(sessionLog),
		bookingJourney: bookingJourney,
		newBookingJourney: newBookingJourney,
		requests: buildRequests(sessionLog),
		partnerJourney: buildPartnerJourney(sessionLog),
		ratesAccuracySummary: buildRatesAccuracySummary(sessionLog),
		searchJourney: buildSearchJourney(sessionLog)
	};
};

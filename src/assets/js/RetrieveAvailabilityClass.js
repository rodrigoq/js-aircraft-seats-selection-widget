(function () {
   'use strict';
}());

import { putData } from './CacheServiceHelper.js';
import { buildSeatsWrapper } from './BuildWrapper.js';
//import * as SeatsCallBacksHelper from './SeatsCallBacksHelper.js';
import * as SeatsBuilder from './Seats.js';
//import * as RequestServiceHelper from './RequestServiceHelper.js';

/**
 * Retrieve Availability Class
 *
 * Fetches historic basket and search data.
 **/
export default class RetrieveAvailabilityClass {

    constructor(config) {
        buildSeatsWrapper('#seat-results');
        this.config = config;
        this.config.siteUrl = 'https://'+this.config.siteUrl;
        this.loader = document.getElementById('loader');
        this.seatResults = document.getElementById('seat-results');
        this.iFrame = document.createElement('iframe');
        this.iFrame.addEventListener('load', () => this.setHistoricBasketUrl());
        this.iFrame.style.display = 'none';
        this.iFrame.src = `${this.config.siteUrl}/jam/session/create?session=null`;
        // Cache DOM
        this.backButton = document.querySelector('.button__back');
        this.continueButton = document.querySelector('#continueButton');
        document.body.appendChild(this.iFrame);
    }

    /**
     * setHistoricBasketUrl()
     *
     * @return getHistoricBasket()
     *
     * Create historic basket jam url.
     **/
    setHistoricBasketUrl() {
        console.log(self.config);
        const fetchUrl = `${this.config.siteUrl}/jam/historicbasket?ref=${this.config.ref}&system=ATCORE&surname=${this.config.surname}`;
        this.getHistoricBasket(fetchUrl);
    }

    /**
     * setAirportsUrl()
     *
     * @return getAirports()
     *
     * Create airports jam url.
     **/
    setAirportsUrl() {
        this.config.airportsJam = `/jam/airports`;
        const fetchUrl = `${this.config.siteUrl}${this.config.airportsJam}`;
        this.getAirports(fetchUrl);
    }

    /**
     * setSeatLanguagesUrl()
     *
     * @return getSeatLanguages()
     *
     * Create seat languages jam url.
     **/
    setSeatLanguagesUrl() {
        this.config.seatLangJam = `/jam/languages/seat-selection/results`;
        const fetchUrl = `${this.config.siteUrl}${this.config.seatLangJam}`;
        this.getSeatLanguages(fetchUrl);
    }

    /**
     * setSplashesUrl()
     *
     * @return getSplashes()
     *
     * Create splashes jam url.
     **/
    setSplashesUrl() {
        this.config.splashesJam = `/jam/splashes`;
        const fetchUrl = `${this.config.siteUrl}${this.config.splashesJam}`;
        this.getSplashes(fetchUrl);
    }

    /**
     * setSearchUrl()
     *
     * @return getHistoricBasket()
     *
     * Create search jam url.
     **/
    setSearchUrl() {
        const fetchUrl = `${this.config.siteUrl}/jam/search`;
        this.getSearch(fetchUrl);
    }

    /**
     * getHistoricBasket()
     *
     * @param { string } fetchUrl
     * @return setSerachUrl()
     *
     * Get the historic basked data.
     **/
    getHistoricBasket(fetchUrl) {
        fetch(fetchUrl, {credentials:'include'})
        .then(response => response.json())
        .then(response => {
           console.log('getHistoricBasket: ', response); // eslint-disable-line
           //this.setSearchUrl();
           this.setAirportsUrl();
        })
        .catch((err) => console.log('error: ', err));  // eslint-disable-line
    }

    /**
     * getAirports()
     *
     * @param { string } fetchUrl
     * @return setSerachUrl()
     *
     * Get airports data.
     **/
    getAirports(fetchUrl) {
        putData(fetchUrl);
        this.setSeatLanguagesUrl();
    }

    /**
     * getSeatLanguages()
     *
     * @param { string } fetchUrl
     * @return setSplashesUrl()
     *
     * Get airports data.
     **/
    getSeatLanguages(fetchUrl) {
        putData(fetchUrl);
        this.setSplashesUrl();
    }

    /**
     * getSplashes()
     *
     * @param { string } fetchUrl
     * @return setSerachUrl()
     *
     * Get airports data.
     **/
    getSplashes(fetchUrl) {
        putData(fetchUrl);
        this.setSearchUrl();
    }

    
    /**
     * getSearch()
     *
     * @param { string } fetchUrl
     * @return SeatsBuilder.Seats()
     *
     * Get the search data.
     **/
    getSearch(fetchUrl) {
        console.log('getSearch');
        fetch(fetchUrl, {
            credentials: 'include',
            method: 'POST',
            body: JSON.stringify({'journey':'seats'})
        })
        .then(response => response.json())
        .then(response => {
            console.log(response);
            this.seats = new SeatsBuilder.Seats(response.results, null, {
                selectionRequired: () => this.selectionRequired(),
                allPaxSelected: () => this.allPaxSelected(),
                allSelected: () => this.allSelected(), 
                afterBasket: () => this.afterBasket()
            }, this.config);
        })
        .catch((err) => console.log(`error: `, err)); // eslint-disable-line
    }
    /**
     * selectionRequired()
     *
     * @return
     *
     * Something about selection required goes here.
     **/
    selectionRequired() {
        this.continueButton.style.display = 'none';
        const SEAT_LANGUAGES = SeatsBuilder.getSeatLanguagesData(this.config.siteUrl, this.config.seatLangJam);
        if (this.seats.isFirstLeg()) {
            this.backButton.style.display = 'none';
        } else {
            this.backButton.style.display = 'block';
            this.backButton.onclick = function() {
                this.seats.prevPlane();
            };
            this.backButton.innerHTML = SEAT_LANGUAGES['seatSelection.nav.previous'];
        }
    }

    /**
     * allPaxSelected()
     *
     * @return
     *
     * Something about allPaxSelected goes here.
     **/
    allPaxSelected() {
        var _this = this;
        this.continueButton.style.display = 'block';
        this.continueButton.onclick = function(){
            _this.seats.validate(function(){
                _this.seats.nextIncompletePlane();
            });
        };
        const SEAT_LANGUAGES = SeatsBuilder.getSeatLanguagesData(this.config.siteUrl, this.config.seatLangJam);
        console.log(SEAT_LANGUAGES);
        this.continueButton.innerHTML = SEAT_LANGUAGES['seatSelection.nav.next'];
    }

    /**
     * allSelected()
     *
     * @return
     *
     * Something about allSelected goes here.
     **/
    allSelected() {
        var _this = this;
        this.continueButton.style.display = 'block';
        const SEAT_LANGUAGES = SeatsBuilder.getSeatLanguagesData(this.config.siteUrl, this.config.seatLangJam); // eslint-disable-line

        if (this.seats.isLastLeg()){
            this.continueButton.onclick = function(){
                _this.seats.validate(function(){
                    _this.seats.addToBasket();
                });
            };
            this.continueButton.innerHTML = SEAT_LANGUAGES['seatSelection.nav.basketBtn'];
        } else {
            this.continueButton.onclick = function(){
                _this.seats.validate(function(){
                    _this.seats.nextPlane();
                });    
            };
            this.continueButton.innerHTML = SEAT_LANGUAGES['seatSelection.nav.next'];
        }
    }

    /**
     * afterBasket()
     *
     * @return
     *
     * Something about afterBasket goes here.
     **/
    afterBasket() {
        // N.B This should be config.
        window.location = `${this.config.siteUrl}/checkout/basket`;
    }

}
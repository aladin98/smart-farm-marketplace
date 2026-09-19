sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"smartfarm/marketplace/productsui/test/integration/pages/ProductsList.gen",
	"smartfarm/marketplace/productsui/test/integration/pages/ProductsObjectPage.gen"
], function (JourneyRunner, ProductsListGenerated, ProductsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('smartfarm/marketplace/productsui') + '/test/flp.html#app-preview',
        pages: {
			onTheProductsListGenerated: ProductsListGenerated,
			onTheProductsObjectPageGenerated: ProductsObjectPageGenerated
        },
        async: true
    });

    return runner;
});


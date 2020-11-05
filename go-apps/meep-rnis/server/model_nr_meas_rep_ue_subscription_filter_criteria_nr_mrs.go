/*
 * AdvantEDGE Radio Network Information Service REST API
 *
 * Radio Network Information Service is AdvantEDGE's implementation of [ETSI MEC ISG MEC012 RNI API](http://www.etsi.org/deliver/etsi_gs/MEC/001_099/012/02.01.01_60/gs_MEC012v020101p.pdf) <p>[Copyright (c) ETSI 2017](https://forge.etsi.org/etsi-forge-copyright-notice.txt) <p>**Micro-service**<br>[meep-rnis](https://github.com/InterDigitalInc/AdvantEDGE/tree/master/go-apps/meep-rnis) <p>**Type & Usage**<br>Edge Service used by edge applications that want to get information about radio conditions in the network <p>**Details**<br>API details available at _your-AdvantEDGE-ip-address/api_
 *
 * API version: 2.1.1
 * Contact: AdvantEDGE@InterDigital.com
 * Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 */
package server

// List of filtering criteria for the subscription. Any filtering criteria from below, which is included in the request, shall also be included in the response.
type NrMeasRepUeSubscriptionFilterCriteriaNrMrs struct {
	// Unique identifier for the MEC application instance.
	AppInstanceId string `json:"appInstanceId,omitempty"`
	// 0 to N identifiers to associate the information for a specific UE or flow.
	AssociateId []AssociateId `json:"associateId,omitempty"`
	// NR Cell Global Identier.
	Nrcgi []NRcgi `json:"nrcgi,omitempty"`
	// Corresponds to a specific 5G UE Measurement Report trigger.
	TriggerNr []TriggerNr `json:"triggerNr,omitempty"`
}

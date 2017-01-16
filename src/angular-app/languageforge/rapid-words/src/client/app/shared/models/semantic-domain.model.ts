// A single semantic domain.
export interface SemanticDomain {
    "guid" : string,
    "key" : string,
    "abbr" : string,
    "name" : string,
    "description" : string,
    "value" : string
}

// A collection of semantic domains, indexed by string key (e.g., "1.3.4");
export interface SemanticDomainCollection {
    [index: string] : SemanticDomain;
}

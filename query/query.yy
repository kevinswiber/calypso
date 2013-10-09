%left OR
%left AND
%left NOT

%start root

%%

root
  : select_statement EOF
    { return $1; }
  ;

select_statement
  : SELECT fields where_optional orderby_optional
    { $$ = new yy.SelectStatementNode($2, $3, $4); }
  | where_clause orderby_optional
    { $$ = new yy.SelectStatementNode(new yy.FieldListNode('*'), $1, $2); }
  ; 

fields
  : column_list 
  | '*'
    { $$ = new yy.FieldListNode('*'); }
  ;

column_list
  : column
    { $$ = new yy.FieldListNode($1); }
  | column_list ',' column
    { $1.push($3); $$ = $1; }
  ;

column
  : NAME
  ;

where_optional
  : /* empty */
  | where_clause
  ;

where_clause 
  : WHERE filter 
    { $$ = new yy.FilterNode($2); }
  ;

conjunction
  : filter AND filter 
    { $$ = new yy.ConjunctionNode($1, $3); }
  ;

disjunction
  : filter OR filter 
    { $$ = new yy.DisjunctionNode($1, $3); }
  ;

filter
  : predicate
  | conjunction
  | disjunction
  | '(' filter ')'
    { $$ = $2 }
  | NOT filter
    { $$ = $2.negate(); }
  ;

predicate
  : comparison_predicate
  | contains_predicate
  | location_predicate
  ;

comparison_predicate
  : column COMPARISON literal 
    { $$ = new yy.ComparisonPredicateNode($1, $2, $3); }
  ;

contains_predicate
  : column CONTAINS STRING
    { $$ = new yy.ContainsPredicateNode($1, $3); }
  | column CONTAINS PARAM
    { $$ = new yy.ContainsPredicateNode($1, $3); }
  ;

location_predicate
  : column WITHIN location
    { $$ = new yy.LocationPredicateNode($1, $3); }
  ;

location
  : NUMBER OF coordinates
    { $$ = new yy.LocationNode($1, $3); }
  ;

coordinates
  : NUMBER ',' NUMBER
    { $$ = new yy.CoordinatesNode($1, $3); }
  ;

orderby_optional
  : /* empty */
  | orderby_clause
  ;

orderby_clause
  : ORDERBY sort_list
    { $$ = new yy.OrderByNode($2); }
  ;

sort_list
  : sort_expression 
    { $$ = new yy.SortListNode($1); }
  | sort_list ',' sort_expression
    { $1.push($3); $$ = $1; }
  ;

sort_expression
  : NAME direction
    { $$ = new yy.SortNode($1, $2); }
  ;

direction
  : /* empty */
  | ASC
  | DESC
  ;

boolean
  : TRUE
  | FALSE
  ;

literal
  : NUMBER
  | STRING
  | PARAM
  | boolean
  | NULL
  ;

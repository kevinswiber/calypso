number        [+-]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?
name          [A-Za-z0-9_-][\.A-Za-z0-9_-]*
escaped_name  \[(?:(?!\])[^\\]|\\.)*\]

%options case-insensitive

%x sel fltr asgn loc ordby

%%

<INITIAL,sel,fltr,asgn,loc,ordby>\s+    /* skip whitespace */
"select"                                {
                                          this.begin('sel');
                                          return 'SELECT';
                                        }
<sel,fltr,loc,ordby>","                 return ','
<sel>"*"                                return '*'
<sel>"as"                               return 'AS'
<INITIAL,sel>"where"                    {
                                          this.popState(); /* in: INITIAL */
                                          this.begin('fltr');
                                          return 'WHERE';
                                        }
<sel,fltr>"order by"                    {
                                          this.popState(); /* in: INITIAL */
                                          this.begin('ordby');
                                          return 'ORDERBY';
                                        }
<sel>{name}                             return 'NAME'
<sel>{escaped_name}                     {
                                          yytext = yytext.slice(1, -1);
                                          return 'NAME';
                                        }
<fltr>"and"                             return 'AND'
<fltr>"or"                              return 'OR'
<fltr>"not"                             return 'NOT'
<fltr>"&&"                              return 'AND'
<fltr>"||"                              return 'OR'
<sel,fltr,ordby><<EOF>>                 {
                                          this.popState(); /* in: INITIAL */
                                          return 'EOF';
                                        }
<fltr>{name}                            {
                                          this.begin('asgn');
                                          return 'NAME';
                                        }
<fltr>{escaped_name}                    {
                                          this.begin('asgn');
                                          yytext = yytext.slice(1, -1);
                                          return 'NAME';
                                        }
<fltr>"("                               return '('
<fltr>")"                               return ')'
<asgn>"eq"|"gt"|"lt"|"gte"|"lte"        return 'COMPARISON'
<asgn>">="|"<="                         {
                                          yytext = letterify(yytext);
                                          return 'COMPARISON';
                                        }
<asgn>"="|">"|"<"                       {
                                          yytext = letterify(yytext);
                                          return 'COMPARISON';
                                        }
<asgn>"not"                             return 'NOT'
<asgn>"contains"                        return 'CONTAINS'
<asgn>"like"                            return 'LIKE'
<asgn>"within"                          {
                                          this.begin('loc');
                                          return 'WITHIN';
                                        }
<asgn>(\@\w+)                           {
                                          this.popState(); /* in fltr */
                                          return 'PARAM';
                                        }
<asgn>(["'])(?:(?!\1)[^\\]|\\.)*\1      {
                                          this.popState(); /* in: fltr */
                                          return 'STRING';
                                        }
<asgn>{number}                          {
                                          this.popState(); /* in: fltr */
                                          return 'NUMBER';
                                        }
<asgn>"true"                            {
                                          this.popState(); /* in fltr */
                                          yytext = true;
                                          return 'TRUE';
                                        }
<asgn>"false"                           {
                                          this.popState(); /* in fltr */
                                          yytext = false;
                                          return 'FALSE';
                                        }
<asgn>"null"                            {
                                          this.popState(); /* in fltr */
                                          yytext = null;
                                          return 'NULL';
                                        }
<loc>{number}                           return 'NUMBER'
<loc>"of"                               return 'OF'
<loc>"and"                              {
                                          this.popState(); /* in: asgn */
                                          this.popState(); /* in: fltr */
                                          return 'AND';
                                        }
<loc>"or"                               {
                                          this.popState(); /* in: asgn */
                                          this.popState(); /* in: fltr */
                                          return 'OR';
                                        }
<loc>"order by"                         {
                                          this.popState(); /* in: asgn */
                                          this.popState(); /* in: fltr */
                                          this.begin('ordby');
                                          return 'ORDERBY';
                                        }
<ordby>"ASC"                            return 'ASC'
<ordby>"DESC"                           return 'DESC'
<ordby>{name}                           return 'NAME'
<ordby>{escaped_name}                   {
                                          yytext = yytext.slice(1, -1);
                                          return 'NAME';
                                        }
<INITIAL,loc><<EOF>>                    return 'EOF'

%%

function letterify(op) {
  switch(op) {
    case '=' : op = 'eq'; break;
    case '>' : op = 'gt'; break;
    case '<' : op = 'lt'; break;
    case '>=' : op = 'gte'; break;
    case '<=' : op = 'lte'; break;
  }

  return op;
}

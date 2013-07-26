%define platform openmooc
%define component askbot
%define version 0.1dev
%define release 1
%define libname %{component}%{platform}

Summary: Askbot openmooc integration like theme and saml2
Name: %{platform}-%{component}
Version: %{version}
Release: %{release}

Source0: %{name}-%{version}.tar.gz

Source1: openmooc-askbot.wsgi
Source2: openmooc-askbot.conf
Source3: local_settings.py
Source4: openmooc-askbot-admin.py
Source5: server.key
Source6: server.crt


License: Apache Software License
Group: Development/Libraries
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-buildroot
Prefix: %{_prefix}
Vendor: Rooter <info@rooter.es>
URL: https://github.com/OpenMOOC/askbot-openmooc
Requires: askbot = 0.7.48, python-djangosaml2 = 0.10.0, python-memcached = 1.48
Requires: python-gunicorn >= 0.14.6, python-requests >= 1.1.0
Requires: nginx, supervisor >= 2.1.8
Requires: xmlsec1 >= 1.2.16, xmlsec1-ssl >= 1.2.16

%description
Askbot customizations for OpenMOOC
==================================

 * OpenMOOC theme
 * Specific Settings
 * SAML2 integration
 * Custom Locales


%prep
%setup -n %{name}-%{version}

%build
%{__python} setup.py build

%install
%{__python} setup.py install -O1 --skip-build --root %{buildroot}


# Create directories

# /usr/share/doc/openmooc/askbot
install -d -m 755 %{buildroot}/%{_defaultdocdir}/%{platform}/askbot

# /etc/openmooc/askbot
install -d -m 755 %{buildroot}/%{_sysconfdir}/%{platform}/%{component}
install -m 644 %{SOURCE3} %{buildroot}/%{_sysconfdir}/%{platform}/%{component}

# /etc/openmooc/askbot/instances
install -d -m 755 %{buildroot}/%{_sysconfdir}/%{platform}/%{component}/instances

# /etc/openmooc/askbot/certs
install -d -m 755 %{buildroot}/%{_sysconfdir}/%{platform}/%{component}/certs/
install -m 440 %{SOURCE5} %{buildroot}/%{_sysconfdir}/%{platform}/%{component}/certs/
install -m 440 %{SOURCE6} %{buildroot}/%{_sysconfdir}/%{platform}/%{component}/certs/

# saml2 attribute-maps
install -d -m 755 %{buildroot}/%{_sysconfdir}/%{platform}/%{component}/saml2/
cp -a askbotopenmooc/saml2/attribute-maps %{buildroot}/%{_sysconfdir}/%{platform}/%{component}/saml2/


# /usr/libexexec/
install -d -m 755 %{buildroot}/%{_libexecdir}/
install -m 755 %{SOURCE1} %{buildroot}/%{_libexecdir}/

# /usr/bin/openmooc-askbot-admin.py
install -d -m 755 %{buildroot}/%{_bindir}/
install -m 755 %{SOURCE4} %{buildroot}/%{_bindir}/

# /var/lib/openmooc/askbot
install -d -m 755 %{buildroot}/%{_sharedstatedir}/%{platform}/%{component}

# /var/lib/openmooc/askbot/instances
install -d -m 755 %{buildroot}/%{_sharedstatedir}/%{platform}/%{component}/instances

# /var/run/openmooc [gunicorn sockets]
install -d -m 770 %{buildroot}%{_localstatedir}/run/openmooc

# /var/log/openmooc
install -d -m 775 %{buildroot}%{_localstatedir}/log/openmooc

# nginx conf
install -d -m 755 %{buildroot}/%{_sysconfdir}/nginx/conf.d
install -m 755 %{SOURCE2} %{buildroot}/%{_sysconfdir}/nginx/conf.d/%{name}.conf



%clean
rm -rf $RPM_BUILD_ROOT

%post

## Preconfigure supervisor
if ! grep "^# OPENMOOC" /etc/supervisord.conf > /dev/null ; then
    cat /etc/supervisord.conf << EOF

# OPENMOOC - Don't delete this line, this section is generate by openmooc rpms
[include]
files = /etc/openmooc/*/supervisord.conf

EOF
fi

## Create group openmooc-askbot
if ! getent group %name > /dev/null ; then
    groupadd %name
fi

## Create custom link for fix xmlsec library load
# xmlsec1 link
if ! [ -e /lib64/libxmlsec1-openssl.so ]; then
    ln -s /usr/lib64/libxmlsec1-openssl.so.1 %{_prefix}/lib64/libxmlsec1-openssl.so
fi

## Message to notice about collectstatic
echo "INFO: You must execute openmooc-askbot-admin.py collectstatic"

%files
%defattr(-,root,root)

%doc docs/ README.rst COPYING

%dir %{_defaultdocdir}/
%dir %{_sysconfdir}/%{platform}
%dir %{_sysconfdir}/%{platform}/%{component}
%dir %{_sysconfdir}/%{platform}/%{component}/instances
%dir %{_sysconfdir}/%{platform}/%{component}/certs
%dir %{_sharedstatedir}/%{platform}/%{component}
%dir %{_sharedstatedir}/%{platform}/%{component}/instances


%config(noreplace) %{_sysconfdir}/%{platform}/%{component}/certs/server.key
%config(noreplace) %{_sysconfdir}/%{platform}/%{component}/certs/server.crt
%config(noreplace) %{_sysconfdir}/%{platform}/%{component}/local_settings.py*

%config(noreplace) %{_sysconfdir}/nginx/conf.d/%{name}.conf

%config(noreplace) %{_sysconfdir}/%{platform}/%{component}/saml2/attribute-maps/*py*

%attr(0755,root,%name) %{_libexecdir}/%{name}.wsgi
%attr(0755,root,%name) %{_bindir}/%{name}-admin.py*

%dir %{python_sitelib}/%{libname}/
%dir %{python_sitelib}/%{libname}/askbotopenmoocapp
%dir %{python_sitelib}/%{libname}/askbotopenmoocapp/management
%dir %{python_sitelib}/%{libname}/askbotopenmoocapp/management/commands
%dir %{python_sitelib}/%{libname}/askbotopenmoocapp/migrations
%dir %{python_sitelib}/%{libname}/askbotopenmoocapp/templates
%dir %{python_sitelib}/%{libname}/askbotopenmoocapp/templates/mooc
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/media
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/media/images
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/media/bootstrap/css
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/media/style
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/templates
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/templates/widgets
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/templates/meta
%dir %{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/templates/question
%dir %{python_sitelib}/%{libname}/admin-templates
%dir %{python_sitelib}/%{libname}/admin-templates/admin
%dir %{python_sitelib}/%{libname}/locale/en/LC_MESSAGES/
%dir %{python_sitelib}/%{libname}/locale/es/LC_MESSAGES/
%dir %{python_sitelib}/%{libname}/saml2
%dir %{python_sitelib}/%{libname}/saml2/attribute-maps

%dir %{python_sitelib}/%{platform}_%{component}-%{version}-*.egg-info/

%attr(0770,root,%name) %dir %{_localstatedir}/log/openmooc

%{python_sitelib}/%{libname}/*.py*
%{python_sitelib}/%{libname}/askbotopenmoocapp/*.py*
%{python_sitelib}/%{libname}/askbotopenmoocapp/management/*.py*
%{python_sitelib}/%{libname}/askbotopenmoocapp/management/commands/*.py*
%{python_sitelib}/%{libname}/askbotopenmoocapp/migrations/*.py*
%{python_sitelib}/%{libname}/askbotopenmoocapp/templates/mooc/*.html
%{python_sitelib}/%{libname}/admin-templates/admin/*.html
%{python_sitelib}/%{libname}/saml2/attribute-maps/*py*

%{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/media/images/*
%{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/media/bootstrap/css/bootstrap.css
%{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/media/style/*.css
%{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/media/js/*.js
%{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/templates/widgets/*.html
%{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/templates/meta/*.html
%{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/templates/question/*.html
%{python_sitelib}/%{libname}/askbot-openmooc-themes/mooc/templates/main_page/*.html

%{python_sitelib}/%{libname}/locale/en/LC_MESSAGES/*
%{python_sitelib}/%{libname}/locale/es/LC_MESSAGES/*

%{python_sitelib}/%{platform}_%{component}-%{version}-*.egg-info/*
